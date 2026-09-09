"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import type { NowPlaying } from "@/lib/spotify";

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
function formatTime(ms: number): string {
  throw new Error("not implemented");
}

// TODO: Equalizer()
//
// function Equalizer({ active }: { active: boolean })
//
// Renders 4 bars (a <div> each is fine) using eqDelays above, one delay per
// bar in order. Each bar needs a base look plus a conditional look:
//   - active:   `animate-eq-bar ${eqDelays[i]} motion-reduce:animate-none`
//   - inactive: `scale-y-[0.3] opacity-40` (static — reads as a paused icon,
//               not a broken animation)
// `active` should be `data.status === "playing"` from the caller. Give the
// wrapper `aria-hidden="true"` — it's decorative, the aria-live paragraph in
// the main render already announces the actual status in words.
function Equalizer({ active }: { active: boolean }) {
  throw new Error("not implemented");
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
//        to subtract ageMs from the fetched progressMs before calling
//        setData, so "elapsed since fetch" (step 2) and "age of the fetch
//        itself" (this step) compose additively instead of needing separate
//        tracking. Do NOT compare the payload's `fetchedAt` against client
//        `Date.now()` for this — clock skew between server and client makes
//        that worse than useless; `Age` is the CDN's own accounting and is
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
export default function NowPlayingClient({
  initial,
}: {
  initial: NowPlaying;
}) {
  throw new Error("not implemented");
}
