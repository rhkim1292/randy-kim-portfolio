import { getNowPlaying, type NowPlaying } from "@/lib/spotify";

// Instance-local payload memo. The CDN only collapses requests that share a
// URL; "?x=1", "?x=2", "?x=3" are three distinct cache keys and would
// otherwise become three lambda invocations AND three upstream Spotify
// calls. This bounds upstream traffic per instance regardless of what query
// string the caller invents. See spec "Why the memo is required, not an
// optimization" — without it this route is an open proxy onto the Spotify
// API.
let memo: { data: NowPlaying; at: number } | null = null;
const MEMO_MS = 10_000;

// TODO: mockPayload()
//
// Dev-only fixture lookup used by the block below. Takes the `mock` query
// param value and returns a hand-written NowPlaying object for that state —
// no network, no imports from lib/spotify's normalizers, just literal
// objects matching the NowPlaying type. Cover all six states the spec's
// verification table exercises:
//   - "playing"     status: "playing", a normal track with progressMs < durationMs
//   - "paused"      status: "paused", frozen progress
//   - "recent"      status: "recent", progressMs: null (this is the fallback shape)
//   - "unavailable" status: "unavailable", fetchedAt: Date.now() only — no other fields
//   - "longtitle"   status: "playing", a deliberately long title/artist string,
//                   to prove truncation works (min-w-0 + truncate) instead of
//                   overflowing the layout
//   - "noart"       status: "playing", imageUrl: null, to prove the SiSpotify
//                   glyph fallback renders instead of a broken <Image>
// Any name that doesn't match one of these — return the "unavailable" shape
// rather than throwing, so a typo'd ?mock= value degrades safely.
function mockPayload(name: string): NowPlaying {
  const playingRes: NowPlaying = {
    status: "playing",
    title:
      "Ocarina of Time Title Theme - Zelda Bitcrushed Old Speaker Lofi Mix",
    artist: "Nostalgiacore",
    album:
      "Ocarina of Time Title Theme (Zelda Bitcrushed Old Speaker Lofi Mix)",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02877bcb4bdca0271564657a77",
    url: "https://open.spotify.com/track/1QySxJktAvWx7cwk96ncNP",
    durationMs: 80357,
    progressMs: 19402,
    fetchedAt: 1788931844107,
  };

  const pausedRes: NowPlaying = {
    status: "paused",
    title:
      "Ocarina of Time Title Theme - Zelda Bitcrushed Old Speaker Lofi Mix",
    artist: "Nostalgiacore",
    album:
      "Ocarina of Time Title Theme (Zelda Bitcrushed Old Speaker Lofi Mix)",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02877bcb4bdca0271564657a77",
    url: "https://open.spotify.com/track/1QySxJktAvWx7cwk96ncNP",
    durationMs: 80357,
    progressMs: 19402,
    fetchedAt: 1788931844107,
  };

  const recentRes: NowPlaying = {
    status: "recent",
    title:
      "Ocarina of Time Title Theme - Zelda Bitcrushed Old Speaker Lofi Mix",
    artist: "Nostalgiacore",
    album:
      "Ocarina of Time Title Theme (Zelda Bitcrushed Old Speaker Lofi Mix)",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02877bcb4bdca0271564657a77",
    url: "https://open.spotify.com/track/1QySxJktAvWx7cwk96ncNP",
    durationMs: 80357,
    progressMs: null,
    fetchedAt: 1788931940980,
  };

  const unavailableRes: NowPlaying = {
    status: "unavailable",
    fetchedAt: Date.now(),
  };

  const longTitleRes: NowPlaying = {
    status: "playing",
    title:
      "Ocarina of Time Title Theme - Zelda Bitcrushed Old Speaker Lofi Mix",
    artist: "Nostalgiacore",
    album:
      "Ocarina of Time Title Theme (Zelda Bitcrushed Old Speaker Lofi Mix)",
    imageUrl:
      "https://i.scdn.co/image/ab67616d00001e02877bcb4bdca0271564657a77",
    url: "https://open.spotify.com/track/1QySxJktAvWx7cwk96ncNP",
    durationMs: 80357,
    progressMs: 19402,
    fetchedAt: 1788931844107,
  };

  const noArtRes: NowPlaying = {
    status: "playing",
    title:
      "Ocarina of Time Title Theme - Zelda Bitcrushed Old Speaker Lofi Mix",
    artist: "Nostalgiacore",
    album:
      "Ocarina of Time Title Theme (Zelda Bitcrushed Old Speaker Lofi Mix)",
    imageUrl: null,
    url: "https://open.spotify.com/track/1QySxJktAvWx7cwk96ncNP",
    durationMs: 80357,
    progressMs: 19402,
    fetchedAt: 1788931844107,
  };

  switch (name) {
    case "playing":
      return playingRes;
    case "paused":
      return pausedRes;
    case "recent":
      return recentRes;
    case "unavailable":
      return unavailableRes;
    case "longtitle":
      return longTitleRes;
    case "noart":
      return noArtRes;
    default:
      return unavailableRes;
  }
}

// TODO: GET()
//
// export async function GET(request: Request)
//
// 1. Dev-only mock escape hatch — gated on `process.env.NODE_ENV !==
//    "production"` (this is also false on Vercel Preview builds, which is
//    correct: mocks should never be reachable on a public preview URL).
//    Read `mock` off `new URL(request.url).searchParams`. If present, return
//    `Response.json(mockPayload(mock), { headers: { "Cache-Control":
//    "no-store" } })` immediately — mocks must never get cached upstream of
//    this route, or a stale mock would leak into production-looking
//    responses.
// 2. Payload memo — if `memo` is null OR more than MEMO_MS has elapsed since
//    `memo.at`, refresh it: `memo = { data: await getNowPlaying("no-store"),
//    at: Date.now() }`. Note "no-store" here, not a revalidate window — this
//    route is already dynamic by default (it's a route handler, not a page),
//    and getNowPlaying's own network calls inside lib/spotify.ts have their
//    own 4s timeout, so there's no caching trap to worry about here the way
//    there is in the Server Component.
// 3. Return `Response.json(memo.data, { headers: { "Cache-Control": "public,
//    s-maxage=15, stale-while-revalidate=45" } })` — this is what lets the
//    CDN collapse concurrent requests that share the exact URL (no query
//    string) into one origin hit every 15s, on top of the memo's per-instance
//    10s floor.
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    const params = new URL(request.url).searchParams;
    const mockParam = params.get("mock");
    if (mockParam) {
      return Response.json(mockPayload(mockParam), {
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  if (!memo || Date.now() - memo.at > MEMO_MS) {
    memo = {
      data: await getNowPlaying("no-store"),
      at: Date.now(),
    };
  }

  return Response.json(memo.data, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
    },
  });
}
