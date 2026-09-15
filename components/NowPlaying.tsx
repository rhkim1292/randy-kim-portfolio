import NowPlayingClient from "@/components/NowPlayingClient";
import { getNowPlaying, isSpotifyConfigured } from "@/lib/spotify";

// TODO: NowPlaying()
//
// export default async function NowPlaying()
//
// Async Server Component — this is what actually mounts on the real page
// (app/page.tsx currently mounts NowPlayingClient directly with a hardcoded
// mock `initial`, left over from the step 8 checkpoint; this component is
// what that gets swapped out for). Two things it needs to do, in order:
//
//   1. Guard, before any network call: `if (!isSpotifyConfigured()) return null;`
//      A fresh clone / CI / preview without the three SPOTIFY_* env vars
//      must render nothing here AND mount no client poller at all (spec
//      O7) — without this check, an unconfigured deploy would still ship a
//      client component polling a permanently-unavailable endpoint every
//      60s in every visitor's browser, forever, for a section that renders
//      nothing anyway. This is a different case from a runtime failure
//      (bad token, Spotify down, rate-limited, etc.) — those still return a
//      real "unavailable" status from getNowPlaying below, and
//      NowPlayingClient stays mounted so a transient outage can self-heal
//      on the next poll. isSpotifyConfigured() only catches "not
//      configured at all."
//
//   2. Fetch and render:
//        const initial = await getNowPlaying({ revalidate: 30 });
//        return <NowPlayingClient initial={initial} />;
//      Pass the object `{ revalidate: 30 }`, not the string "no-store" —
//      that's what lets this call participate in the page's own ISR
//      instead of forcing the whole route dynamic (see spec Constraints:
//      a single `no-store` fetch anywhere in the page's render tree forces
//      the entire route dynamic, which is exactly what this component
//      exists to avoid). "no-store" is only correct in the route handler
//      (app/api/spotify/now-playing/route.ts), which is already dynamic by
//      design — getNowPlaying's `mode` parameter is what lets the same
//      function serve both call sites correctly.
export default async function NowPlaying() {}
