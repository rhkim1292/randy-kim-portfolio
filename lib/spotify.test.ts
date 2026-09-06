import { describe, it, expect } from "vitest";
import { normalizeCurrent, pickImage, safeSpotifyUrl } from "./spotify";
import currentlyPlaying from "./__fixtures__/currently-playing.json";
import { NowPlaying } from "./spotify";

describe("Test suite for normalizer functions in spotify.ts", () => {
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
});
