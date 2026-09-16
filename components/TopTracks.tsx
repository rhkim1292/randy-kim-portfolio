import Image from "next/image";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import { getTopTracks, isSpotifyConfigured } from "@/lib/spotify";

// TODO: TopTracks()
//
// Async Server Component, no client JS, no state — mirrors NowPlaying()'s
// guard-then-fetch shape but with its own independent failure path (spec
// O10: a 403 here must not affect the now-playing card and vice versa).
//
//   1. `if (!isSpotifyConfigured()) return null;` — same reasoning as
//      NowPlaying(): an unconfigured deploy renders nothing, and since this
//      component has no client half there's nothing to avoid mounting.
//   2. `const tracks = await getTopTracks(3);`
//   3. `if (!tracks.length) return null;` — getTopTracks() already
//      collapses every failure mode (no creds, 403 from a missing
//      user-top-read scope, 429, 5xx, empty account) to `[]`, so this one
//      check silently absorbs all of them, matching how NowPlayingClient
//      collapses to the "unavailable" status.
//   4. Return the JSX below (verbatim from the spec's "Top tracks block" —
//      copy it out of this comment and into your return statement once the
//      guards above are in place):
//
// <section aria-label="Top tracks" className="border-b border-editor-line px-4 py-6 sm:px-6">
//   <p className="mb-3 font-mono text-xs uppercase tracking-wide text-editor-muted">
//     Top Tracks <span className="text-editor-muted/60">· last 4 weeks</span>
//   </p>
//
//   <ol className="flex flex-col">
//     {tracks.map((track, i) => (
//       <li key={track.id}>
//         <a
//           href={track.url ?? undefined}
//           target="_blank"
//           rel="noreferrer"
//           className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-editor-panel"
//         >
//           <span className="w-5 shrink-0 font-mono text-xs text-editor-violet" aria-hidden="true">
//             {String(i + 1).padStart(2, "0")}
//           </span>
//
//           <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-editor-line bg-editor-panelAlt">
//             {track.imageUrl
//               ? <Image src={track.imageUrl} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
//               : <SiSpotify size={14} className="absolute inset-0 m-auto text-editor-muted" aria-hidden />}
//           </span>
//
//           <span className="min-w-0 flex-1">
//             <span className="block truncate font-mono text-sm text-editor-text group-hover:text-editor-amber">
//               {track.title}
//             </span>
//             <span className="block truncate text-xs text-editor-muted">{track.artist}</span>
//           </span>
//         </a>
//       </li>
//     ))}
//   </ol>
// </section>
//
// Note the visible 01/02/03 is aria-hidden — the <ol> itself already
// conveys order to a screen reader, so leaving the number exposed too
// would double-announce it.
export default async function TopTracks() {
  if (!isSpotifyConfigured()) return null;
  const tracks = await getTopTracks(3);
  if (!tracks.length) return null;

  return (
    <section
      aria-label="Top tracks"
      className="border-b border-editor-line px-4 py-6 sm:px-6"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-editor-muted">
        Top Tracks <span className="text-editor-muted/60">· last 4 weeks</span>
      </p>
      <ol className="flex flex-col">
        {tracks.map((track, i) => (
          <li key={track.id}>
            <a
              href={track.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-editor-panel"
            >
              <span
                className="w-5 shrink-0 font-mono text-xs text-editor-violet"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-editor-line bg-editor-panelAlt">
                {track.imageUrl ? (
                  <Image
                    src={track.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <SiSpotify
                    size={14}
                    className="absolute inset-0 m-auto text-editor-muted"
                    aria-hidden
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-sm text-editor-text group-hover:text-editor-amber">
                  {track.title}
                </span>
                <span className="block truncate text-xs text-editor-muted">
                  {track.artist}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
