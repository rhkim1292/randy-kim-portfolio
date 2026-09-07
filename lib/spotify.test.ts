import { describe, it, expect } from "vitest";
import {
  normalizeCurrent,
  normalizeRecent,
  pickImage,
  safeSpotifyUrl,
} from "./spotify";
import currentlyPlaying from "./__fixtures__/currently-playing.json";
import paused from "./__fixtures__/paused.json";
import recentlyPlayed from "./__fixtures__/recently-played.json";
import { NowPlaying } from "./spotify";

describe("Test suite for normalizeCurrent in spotify.ts", () => {
  it("pickImage returns url for smallest image greater than or equal to 200px", () => {
    expect(pickImage(currentlyPlaying.item.album.images)).toBe(
      "https://i.scdn.co/image/ab67616d00001e02967e9fb8c9f5bb2e9ce2f1bc",
    );
  });

  it("pickImage returns null for empty image array", () => {
    expect(pickImage([])).toBe(null);
  });

  it("safeSpotifyUrl always returns a safe url", () => {
    expect(
      safeSpotifyUrl("http://open.spotify.com/album/0KlELAN2z6hosr3PA7BAr4"),
    ).toBe(null);
    expect(safeSpotifyUrl("http://javascript:alert(1)")).toBe(null);
    expect(safeSpotifyUrl(undefined)).toBe(null);
    expect(
      safeSpotifyUrl(
        "https://api.spotify.com/v1/albums/0KlELAN2z6hosr3PA7BAr4",
      ),
    ).toBe(null);
    expect(
      safeSpotifyUrl("https://open.spotify.com/album/0KlELAN2z6hosr3PA7BAr4"),
    ).toBe("https://open.spotify.com/album/0KlELAN2z6hosr3PA7BAr4");
  });

  it('check that normalizeCurrent returning a NowPlaying object with status = "playing" and artist = (joined artist names)', () => {
    const nowPlaying = normalizeCurrent(currentlyPlaying) as NowPlaying;
    if (
      nowPlaying.status === "playing" ||
      nowPlaying.status === "paused" ||
      nowPlaying.status === "recent"
    ) {
      expect(nowPlaying.status).toBe("playing");
      expect(nowPlaying.artist).toBe("Sub Focus, Dimension");
    } else {
      expect.fail(
        "normalizeCurrent returning incorrect shape with valid json!",
      );
    }
  });

  it("check that normalizeCurrent returns null when input json is null", () => {
    const nowPlaying = normalizeCurrent(null) as NowPlaying;
    expect(nowPlaying).toBe(null);
  });

  it("check that normalizeCurrent returns null when input json has an item property that is null", () => {
    const nowPlaying = normalizeCurrent({
      item: null,
    }) as NowPlaying;
    expect(nowPlaying).toBe(null);
  });

  it('normalizeCurrent asserts nowPlaying.status === "paused" in the returning NowPlaying object', () => {
    const nowPlaying = normalizeCurrent(paused) as NowPlaying;
    expect(nowPlaying.status).toBe("paused");
  });

  it('normalizeCurrent returns null when currently_playing_type === "ad" in the input json', () => {
    const nowPlaying = normalizeCurrent({
      item: {},
      currently_playing_type: "ad",
    }) as NowPlaying;
    expect(nowPlaying).toBe(null);
  });

  it("normalizeCurrent asserts nowPlaying.imageUrl: null in the returning NowPlaying object when json contains no artwork", () => {
    const nowPlaying = normalizeCurrent({
      is_playing: true,
      item: {
        album: {
          images: [],
        },
        artists: [
          {
            name: "Test Artist 1",
          },
          {
            name: "Test Artist 2",
          },
        ],
      },
    }) as NowPlaying;
    if (
      nowPlaying.status === "playing" ||
      nowPlaying.status === "paused" ||
      nowPlaying.status === "recent"
    ) {
      expect(nowPlaying.imageUrl).toBe(null);
    } else {
      expect.fail(
        "normalizeCurrent returning incorrect shape with valid json!",
      );
    }
  });

  it("normalizeCurrent asserts nowPlaying.url: null when item.external_urls.spotify contains a malformed url in the input json", () => {
    const nowPlaying = normalizeCurrent({
      is_playing: true,
      item: {
        album: {
          images: [],
        },
        artists: [
          {
            name: "Test Artist 1",
          },
          {
            name: "Test Artist 2",
          },
        ],
        external_urls: {
          spotify: "http://javascript:alert(1)",
        },
      },
    }) as NowPlaying;

    if (
      nowPlaying.status === "playing" ||
      nowPlaying.status === "paused" ||
      nowPlaying.status === "recent"
    ) {
      expect(nowPlaying.url).toBe(null);
    } else {
      expect.fail(
        "normalizeCurrent returning incorrect shape with valid json!",
      );
    }
  });

  it("normalizeCurrent asserts nowPlaying.url: null when item.external_urls is missing from the json", () => {
    const nowPlaying = normalizeCurrent({
      is_playing: true,
      item: {
        album: {
          images: [],
        },
        artists: [
          {
            name: "Test Artist 1",
          },
          {
            name: "Test Artist 2",
          },
        ],
      },
    }) as NowPlaying;

    if (
      nowPlaying.status === "playing" ||
      nowPlaying.status === "paused" ||
      nowPlaying.status === "recent"
    ) {
      expect(nowPlaying.url).toBe(null);
    } else {
      expect.fail(
        "normalizeCurrent returning incorrect shape with valid json!",
      );
    }
  });
});

describe("Test suite for normalizeRecent in spotify.ts", () => {
  it("normalizeRecent asserts null when json is null", () => {
    const recentNowPlaying = normalizeRecent(null) as NowPlaying;
    expect(recentNowPlaying).toBe(null);
  });

  it("normalizeRecent asserts null when json.items is empty", () => {
    const recentNowPlaying = normalizeRecent({
      items: [],
    }) as NowPlaying;
    expect(recentNowPlaying).toBe(null);
  });

  it('normalizeRecent asserts nowPlaying.status = "recent" at all times when json is not null or json.items is not empty', () => {
    const recentNowPlaying = normalizeRecent(recentlyPlayed) as NowPlaying;
    expect(recentNowPlaying.status).toBe("recent");
  });

  it("normalizeRecent asserts recentNowPlaying.progressMs: null at all times", () => {
    const recentNowPlaying = normalizeRecent(recentlyPlayed) as NowPlaying;
    if (recentNowPlaying.status === "recent") {
      expect(recentNowPlaying.progressMs).toBe(null);
    } else {
      expect.fail("normalizeRecent returning incorrect shape with valid json!");
    }
  });

  it("normalizeRecent correctly asserts the recent track's url", () => {
    const recentNowPlaying = normalizeRecent(recentlyPlayed) as NowPlaying;
    if (recentNowPlaying.status === "recent") {
      expect(recentNowPlaying.url).toBe(
        "https://open.spotify.com/track/7DCdoJx9mCpdxcyk5CtbBM",
      );
    } else {
      expect.fail("normalizeRecent returning incorrect shape with valid json!");
    }
  });
});
