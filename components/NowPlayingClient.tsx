"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import { type NowPlaying } from "@/lib/spotify";

// Per repo's Record<Union, string> convention (see rarityBorder/rarityText
// in InventoryLog.tsx). Teal = live, violet = historical, amber stays
// reserved for the outbound link.
const statusStyles: Record<
  "playing" | "paused" | "recent",
  { border: string; accent: string; bar: string; label: string }
> = {
  playing: {
    border: "border-editor-teal/60",
    accent: "text-editor-teal",
    bar: "bg-editor-teal",
    label: "playing",
  },
  paused: {
    border: "border-editor-line",
    accent: "text-editor-muted",
    bar: "bg-editor-muted",
    label: "paused",
  },
  recent: {
    border: "border-editor-violet/50",
    accent: "text-editor-violet",
    bar: "bg-editor-violet",
    label: "last played",
  },
};

// Literal class strings (not template-composed) so Tailwind's JIT can
// statically extract them at build time.
const eqDelays = [
  "",
  "[animation-delay:120ms]",
  "[animation-delay:260ms]",
  "[animation-delay:60ms]",
];

// TODO: formatTime()
//
// Takes a millisecond count and returns "m:ss" (e.g. 80357 -> "1:20"). Used
// for both the elapsed and total time readouts under the progress bar.
// Seconds should be zero-padded to 2 digits; minutes should not be padded.
export function formatTime(ms: number): string {
  const s = ms / 1000;
  const minuteDigit = Math.floor(s / 60);
  const sTensDigit = Math.floor(s / 10) % 6;
  const sOnesDigit = Math.floor(s % 10);
  const res = `${minuteDigit}:${sTensDigit}${sOnesDigit}`;
  return res;
}

// TODO: Equalizer()
//
// function Equalizer({ active }: { active: boolean })
//
// `base` below is the shared look for every bar regardless of state — size
// and color, picked to match the constant teal "$" prompt in the status row
// (the spec doesn't hand Equalizer the per-status `style` object, just this
// one boolean, so it can't recolor itself per status the way the label does).
//
// What's left: map over eqDelays and fill in the one conditional piece —
// each bar's className needs `base` plus, depending on `active`:
//   - true:  `animate-eq-bar ${delay} motion-reduce:animate-none`
//   - false: `scale-y-[0.3] opacity-40` (static — reads as a paused icon,
//            not a broken animation)
// `delay` here is that bar's entry from eqDelays (index order matters — bar 0
// gets eqDelays[0], bar 1 gets eqDelays[1], etc). `active` itself is always
// `data.status === "playing"`, passed in by the caller.
//
// See the preview: https://claude.ai/code/artifact/a71c7254-8e92-49e1-8608-9c48f88a1071
function Equalizer({ active }: { active: boolean }) {
  const base = "h-2.5 w-0.5 rounded-full bg-editor-teal";

  return (
    <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
      {eqDelays.map((delay, i) =>
        active ? (
          <span
            key={i}
            className={`${base} animate-eq-bar ${delay} motion-reduce:animate-none`}
          />
        ) : (
          <span key={i} className={`${base} scale-y-[0.3] opacity-40`} />
        ),
      )}
    </span>
  );
}

// TODO: NowPlayingClient() This is the bulk of the feature.
//
// export default function NowPlayingClient({ initial }: { initial: NowPlaying })
//
// The exact markup/classes to render are already fully specified in the
// spec's "Visual design — terminal status line" section — copy that JSX
// (the <section> block using `style`, `progress`, `data`, `Equalizer`,
// `formatTime`) rather than reinventing it; what THIS file needs you to
// figure out is the state and effects that markup depends on. Break it into
// pieces:
//
// 1. STATE
//    const [data, setData] = useState<NowPlaying>(initial);
//    const [anchor, setAnchor] = useState<number | null>(null);  // null until after mount
//    const [elapsedMs, setElapsedMs] = useState(0);
//    You'll also want refs for the poll timer id and the backoff delay, since
//    those need to persist across renders without triggering one (useRef,
//    not useState).
//
// 2. HYDRATION SAFETY (React 18, no `use()` available)
//    First render must emit exactly what the server emitted, or you'll get a
//    hydration mismatch warning. Render `data.progressMs` verbatim on first
//    paint; only start applying wall-clock elapsed time inside an effect:
//      useEffect(() => { setAnchor(Date.now()); setElapsedMs(0); }, [data]);
//    Then a second effect ticks once a second, but only while playing and
//    only once mounted (anchor !== null):
//      useEffect(() => {
//        if (data.status !== "playing" || anchor === null) return;
//        const id = setInterval(() => setElapsedMs(Date.now() - anchor), 1000);
//        return () => clearInterval(id);
//      }, [data, anchor]);
//    The value to actually render is `data.status === "playing" ? (data.progressMs ?? 0) + elapsedMs : data.progressMs`
//    — only "playing" ticks locally; "paused"/"recent" stay frozen at
//    whatever the server sent.
//
// 3. FETCHING A POLL
//    Write a function that fetches /api/spotify/now-playing and updates
//    `data`. Two things make this more than a plain fetch:
//      - Dev-only mock forwarding: read `?spotify=<state>` off
//        `window.location.search` (via `new URLSearchParams`) and, if
//        present, append it to the request as `?mock=<state>` — this is what
//        lets `/?spotify=playing` drive the whole page into a given state on
//        demand (see spec Verification table).
//      - CDN staleness correction: a CDN hit can be up to `s-maxage` (15s)
//        old. Read the response's `Age` header:
//          const ageMs = (Number(res.headers.get("age")) || 0) * 1000;
//        and fold it into the progress you'll render — the cleanest way is
//        to ADD ageMs to the fetched progressMs before calling setData: the
//        payload's progressMs was accurate `ageMs` ago, so the track has
//        moved `ageMs` further along by the time you actually received it.
//        (Corrected earlier text said "subtract" — that was wrong; it would
//        make the progress bar jump backwards every time a poll lands,
//        which is exactly the regression the spec's "stale first paint" /
//        "progress bar rewinding" checks are there to catch.) This only
//        makes sense for a numeric progressMs — guard the "recent" case
//        (progressMs is null) so you don't turn `null` into a number.
//        "elapsed since fetch" (step 2) and "age of the fetch itself" (this
//        step) then compose additively instead of needing separate tracking.
//        Do NOT compare the payload's `fetchedAt` against client `Date.now()`
//        for this — clock skew between server and client makes that worse
//        than useless; `Age` is the CDN's own accounting and is
//        clock-skew-free.
//
// 4. POLL SCHEDULING
//    setTimeout chain, not setInterval, because the delay varies by status:
//      - "playing":  Math.min(15_000, remainingMs + 1_000) where remainingMs
//        = durationMs - progressMs, so it flips to the next track ~1s after
//        the current one ends rather than waiting a fixed 15s.
//      - "paused" / "recent" / "unavailable": 60_000.
//      - after a fetch failure: exponential backoff starting at 30_000,
//        doubling (30s -> 60s -> 120s), capped at 300_000, reset back to
//        30_000 on the next success.
//    Poll immediately on mount too, before the first scheduled delay — the
//    server-rendered `initial` can be up to 30s stale (page ISR), and the
//    Age correction above only applies to client fetches, so without an
//    immediate poll the progress bar would start behind and visibly jump
//    forward once the first scheduled poll lands.
//
// 5. BACKGROUND TABS
//    Skip scheduling entirely while `document.hidden` is true, and add a
//    `visibilitychange` listener that fires an immediate poll when the tab
//    becomes visible again. A forgotten background tab should cost zero
//    requests.
//
// 6. RENDER
//    `if (data.status === "unavailable") return null;` — component stays
//    mounted (so the effects above keep running and a transient outage
//    self-heals on the next poll), it just renders nothing. Otherwise
//    compute `style = statusStyles[data.status]` and `progress` (from step
//    2), then render the JSX from the spec's "Visual design" section,
//    passing `style`, `data`, `progress`, `formatTime`, and `<Equalizer
//    active={data.status === "playing"} />` into it.
export default function NowPlayingClient({ initial }: { initial: NowPlaying }) {
  const [data, setData] = useState<NowPlaying>(initial);
  const [anchor, setAnchor] = useState<number | null>(null); // null until after mount
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setAnchor(Date.now());
    setElapsedMs(0);
  }, [data]);

  useEffect(() => {
    if (data.status !== "playing" || anchor === null) return;
    const id = setInterval(() => setElapsedMs(Date.now() - anchor), 1000);
    return () => clearInterval(id);
  }, [data, anchor]);

  const fetchPoll = async () => {
    let fetchURL = "/api/spotify/now-playing";
    const windowSearchParams = new URLSearchParams(window.location.search);
    if (windowSearchParams.has("spotify")) {
      fetchURL += `?mock=${windowSearchParams.get("spotify")}`;
    }
    try {
      const response = await fetch(fetchURL);
      if (!response.ok) {
        throw new Error(
          `NowPlayingClient Fetch Poll Response Status: ${response.status}`,
        );
      }

      const ageMs = (Number(response.headers.get("age")) || 0) * 1000;
      const resData = await response.json();
      const cdnCorrectedProgressMs =
        resData.progressMs === null ? null : resData.progressMs + ageMs;

      setData({
        status: resData.status,
        title: resData.title,
        artist: resData.artist,
        album: resData.album,
        imageUrl: resData.imageUrl,
        url: resData.url,
        durationMs: resData.durationMs,
        progressMs: cdnCorrectedProgressMs,
        fetchedAt: resData.fetchedAt,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // return (
  //   <section
  //     aria-label="Currently playing music"
  //     className="border-b border-editor-line px-4 py-6 sm:px-6"
  //   >
  //     <p className="mb-3 font-mono text-xs uppercase tracking-wide text-editor-muted">
  //       Now Playing
  //     </p>

  //     <div
  //       className={`relative flex items-center gap-4 rounded-lg border-2 bg-editor-panel p-4 ${style.border}`}
  //     >
  //       <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-editor-line bg-editor-panelAlt sm:h-20 sm:w-20">
  //         {data.imageUrl ? (
  //           <Image
  //             src={data.imageUrl}
  //             alt=""
  //             width={80}
  //             height={80}
  //             unoptimized
  //             className="h-full w-full object-cover"
  //           />
  //         ) : (
  //           <SiSpotify
  //             size={22}
  //             className="absolute inset-0 m-auto text-editor-muted"
  //             aria-hidden
  //           />
  //         )}
  //       </div>

  //       <div className="min-w-0 flex-1">
  //         <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide">
  //           <span className="text-editor-teal">$</span>
  //           <span className={style.accent}>{style.label}</span>
  //           <Equalizer active={data.status === "playing"} />
  //         </p>
  //         <p
  //           title={data.album ? `${data.title} — ${data.album}` : data.title}
  //           className="mt-1 truncate font-mono text-sm text-editor-text sm:text-base"
  //         >
  //           {data.title}
  //         </p>
  //         <p className="truncate text-xs text-editor-muted sm:text-sm">
  //           {data.artist}
  //         </p>

  //         {progress !== null && data.durationMs ? (
  //           <div className="mt-2.5">
  //             <div
  //               className="h-1 w-full overflow-hidden rounded-full bg-editor-line"
  //               role="presentation"
  //             >
  //               {/* key on the track: remounting kills the CSS transition, so a new song
  //               snaps to 0% instead of animating backwards from 100% like a rewind */}
  //               <div
  //                 key={data.url ?? data.title}
  //                 className={`h-full rounded-full ${style.bar} transition-[width] duration-1000 ease-linear motion-reduce:transition-none`}
  //                 style={{ width: `${(progress / data.durationMs) * 100}%` }}
  //               />
  //             </div>
  //             <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-editor-muted">
  //               <span>{formatTime(progress)}</span>
  //               <span>{formatTime(data.durationMs)}</span>
  //             </div>
  //           </div>
  //         ) : null}
  //       </div>
  //     </div>

  //     {data.url && (
  //       <div className="mt-3 flex gap-4 border-t border-editor-line pt-3 font-mono text-xs">
  //         <a
  //           href={data.url}
  //           target="_blank"
  //           rel="noreferrer"
  //           className="inline-flex items-center gap-1.5 text-editor-amber hover:underline"
  //         >
  //           <SiSpotify size={13} color="currentColor" title="" aria-hidden />{" "}
  //           open in spotify →
  //         </a>
  //       </div>
  //     )}

  //     <p
  //       aria-live="polite"
  //       className="sr-only"
  //     >{`${style.label}: ${data.title} by ${data.artist}`}</p>
  //   </section>
  // );
}
