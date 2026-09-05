// Only module that reads process.env.SPOTIFY_*. Server-only — never import
// this from a "use client" module.

export type NowPlayingStatus = "playing" | "paused" | "recent" | "unavailable";

export type NowPlaying =
  | {
      status: "playing" | "paused" | "recent";
      title: string;
      artist: string; // joined artist names
      album: string | null; // used only for the truncation tooltip
      imageUrl: string | null;
      url: string | null; // external_urls.spotify
      durationMs: number | null;
      progressMs: number | null; // null when status === "recent"
      fetchedAt: number; // server epoch ms, debugging only
    }
  | { status: "unavailable"; fetchedAt: number };

export type TopTrack = {
  id: string; // Spotify track id, used as the React key
  title: string;
  artist: string; // joined artist names
  imageUrl: string | null;
  url: string | null; // scheme-validated, same helper as now-playing
};

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const TIMEOUT_MS = 4000;

// Warm-lambda token memo. Module-scope, reused across requests on the same
// warm instance. See spec "Auth" + "lib/spotify.ts" sections for why.
let cachedToken: { value: string; expiresAt: number } | null = null;

// TODO: getAccessToken() — your turn.
//
// Read SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN from
// process.env. If any is missing, return null before any network call (this
// is the guard that makes the whole feature a no-op without credentials).
//
// If cachedToken is still valid (with the 60s buffer we just discussed),
// return its value without a network call.
//
// Otherwise POST to TOKEN_ENDPOINT with a Basic auth header (base64 of
// "clientId:clientSecret") and a grant_type=refresh_token body, using
// cache: "no-store" and AbortSignal.timeout(TIMEOUT_MS). On success, store
// the result in cachedToken and return the access token. On failure, clear
// cachedToken, log res.status + Spotify's error fields (not a raw body
// dump), and return null.
export async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    console.warn(
      `[spotify] token refresh failed (${res.status}). Error: ${errorBody.error}, Description: ${errorBody.error_description}`,
    );
    cachedToken = null;
    return null;
  }

  const json = await res.json();

  if (json.refresh_token && json.refresh_token !== refreshToken) {
    console.warn(
      "[spotify] Spotify rotated the refresh token — update SPOTIFY_REFRESH_TOKEN.",
    );
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return cachedToken.value;
}

const API_BASE = "https://api.spotify.com/v1";

// Whether this call participates in ISR (ties to a fetch revalidate window)
// or always hits the network. The caller decides — see the caching trap
// discussion. NEVER hardcode "no-store" inside this file's shared helpers.
export type FetchMode = "no-store" | { revalidate: number };

// TODO: spotifyGet<T>() — your turn.
//
// Generic helper: async function spotifyGet<T>(path: string, mode: FetchMode,
// retryOn401 = true): Promise<T | null>
//
// 1. Call getAccessToken(). If it returns null (no creds, or refresh
//    failed), return null immediately — no network call.
// 2. fetch(`${API_BASE}${path}`, { ... }) with:
//    - Authorization: `Bearer ${token}` header
//    - the cache option derived from `mode`: if mode === "no-store", pass
//      { cache: "no-store" }; otherwise pass { next: { revalidate: mode.revalidate } }
//      (these are mutually exclusive fetch options — you can't pass both)
//    - AbortSignal.timeout(TIMEOUT_MS)
// 3. If res.status === 401 AND retryOn401 is true: clear cachedToken, then
//    call spotifyGet again with the SAME mode and retryOn401=false this
//    time (this is what prevents an infinite retry loop). Return whatever
//    that retry call returns.
// 4. If res.status === 204 (used by currently-playing when nothing is
//    playing): return null. Note this is a valid "nothing to report" case,
//    not a failure — the caller decides what to do about it.
// 5. If !res.ok for any other reason: log res.status, return null.
// 6. Otherwise: return (await res.json()) as T.
export async function spotifyGet<T>(
  path: string,
  mode: FetchMode,
  retryOn401 = true,
): Promise<T | null> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const res = await fetch(
      `${API_BASE}${path}`,
      mode === "no-store"
        ? {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
          }
        : {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            next: { revalidate: mode.revalidate },
            signal: AbortSignal.timeout(TIMEOUT_MS),
          },
    );

    if (res.status === 401 && retryOn401) {
      cachedToken = null;
      return await spotifyGet(path, mode, false);
    }

    if (res.status === 204) return null;

    if (!res.ok) {
      console.log(res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Promise rejected with error: " + error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Normalizers — pure functions, no fetch, no process.env. These are the only
// pieces of this file worth unit-testing: given the same input JSON, they
// always produce the same output, and several of their branches (a playing
// ad, a null item, an empty history, a malformed URL) can't be triggered on
// demand against the live API. Exported so lib/spotify.test.ts can import
// them directly.

type SpotifyImage = { url: string; width: number | null; height: number | null };

// TODO: pickImage() — your turn.
//
// Spotify returns album images LARGEST FIRST. Sort ascending by width, then
// return the url of the smallest image that is still >= 200px wide. If none
// are >= 200px (e.g. only a 64px thumbnail exists), fall back to the largest
// available instead of returning null. Return null only when the array is
// empty.
export function pickImage(images: SpotifyImage[]): string | null {
  throw new Error("not implemented");
}

// TODO: safeSpotifyUrl() — your turn.
//
// external_urls.spotify gets rendered straight into an <a href>. React
// escapes text content but does NOT sanitize URL schemes, so this is the one
// line of defense against something like "javascript:alert(1)" ending up in
// an href. Accept the value only if it's a valid URL whose scheme is
// "https:" and whose host is exactly "open.spotify.com" — anything else
// (wrong scheme, wrong host, missing/undefined input, or a string that
// doesn't even parse as a URL) returns null. Must not throw on a malformed
// string — the URL constructor throws on invalid input, so you'll need to
// handle that.
export function safeSpotifyUrl(url: string | null | undefined): string | null {
  throw new Error("not implemented");
}

// TODO: normalizeCurrent() — your turn.
//
// Takes the parsed JSON body of GET /v1/me/player/currently-playing (a "200"
// response) and returns the "playing"/"paused" arm of NowPlaying, or null
// when the payload isn't a renderable music track — the caller falls back to
// normalizeRecent() in that case. Return null when:
//   - json.item is null (idle player, ad, or — since we never send
//     additional_types — a podcast episode)
//   - json.currently_playing_type is "ad" or "unknown"
// Otherwise build the object from:
//   - title:      json.item.name
//   - artist:     json.item.artists.map(a => a.name).join(", ")
//   - album:      json.item.album.name
//   - imageUrl:   pickImage(json.item.album.images)
//   - url:        safeSpotifyUrl(json.item.external_urls?.spotify)
//   - durationMs: json.item.duration_ms
//   - progressMs: json.progress_ms
//   - status:     json.is_playing ? "playing" : "paused"
//   - fetchedAt:  Date.now()
export function normalizeCurrent(json: any): NowPlaying | null {
  throw new Error("not implemented");
}

// TODO: normalizeRecent() — your turn.
//
// Takes the parsed JSON body of GET /v1/me/player/recently-played?limit=1
// (shape: { items: [{ track, played_at }] }) and returns the "recent" arm of
// NowPlaying, or null when json.items is empty (brand-new account — caller
// treats that as fully unavailable, nothing left to fall back to).
// Same field mapping as normalizeCurrent but reading from items[0].track
// instead of json.item, status is always "recent", and progressMs is always
// null (we don't know how far into the track the user got last time).
export function normalizeRecent(json: any): NowPlaying | null {
  throw new Error("not implemented");
}

// TODO: normalizeTopTracks() — your turn.
//
// Takes the parsed JSON body of GET /v1/me/top/tracks (shape:
// { items: [...] }) and maps it to TopTrack[], preserving order. Empty
// items => empty array, never throws. Per track:
//   - id:       item.id
//   - title:    item.name
//   - artist:   item.artists.map(a => a.name).join(", ")
//   - imageUrl: pickImage(item.album.images)
//   - url:      safeSpotifyUrl(item.external_urls?.spotify)
export function normalizeTopTracks(json: any): TopTrack[] {
  throw new Error("not implemented");
}
