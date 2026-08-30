"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  projectItems,
  itemTypes,
  type ItemType,
  type Rarity,
} from "@/data/projects";

const designDocMarkdownComponents: Components = {
  p: ({ node, ...props }) => (
    <p className="text-sm leading-relaxed text-editor-muted" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      target="_blank"
      rel="noreferrer"
      className="text-editor-amber hover:underline"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-editor-text" {...props} />
  ),
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  code: ({ node, ...props }) => (
    <code
      className="rounded bg-editor-line/40 px-1 py-0.5 font-mono text-[13px] text-editor-text"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-editor-muted"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-editor-muted"
      {...props}
    />
  ),
  li: ({ node, ...props }) => <li {...props} />,
  video: ({ node, className, ...props }) => (
    <span className="my-2 block overflow-hidden rounded-md border border-editor-line">
      <video
        preload="metadata"
        autoPlay
        loop
        playsInline
        className="h-auto w-full"
        {...props}
      />
    </span>
  ),
};

const rarityBorder: Record<Rarity, string> = {
  common: "border-editor-line",
  rare: "border-editor-teal/60",
  epic: "border-editor-violet/60",
  legendary: "border-editor-amber/70",
};

const rarityGlow: Record<Rarity, string> = {
  common: "",
  rare: "shadow-[0_0_16px_-6px] shadow-editor-teal/50",
  epic: "shadow-[0_0_16px_-6px] shadow-editor-violet/50",
  legendary: "shadow-[0_0_20px_-6px] shadow-editor-amber/60",
};

const rarityText: Record<Rarity, string> = {
  common: "text-editor-muted",
  rare: "text-editor-teal",
  epic: "text-editor-violet",
  legendary: "text-editor-amber",
};

// Appends a #t=<seconds> media fragment so a paused, non-autoplaying video
// displays that frame instead of the (often blank) first frame.
function videoSrc(src: string, previewTime?: number) {
  return previewTime ? `${src}#t=${previewTime}` : src;
}

function MaximizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function InventoryLog() {
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const visible =
    filter === "all"
      ? projectItems
      : projectItems.filter((i) => i.type === filter);
  // Below `lg` the slots scroll as a single horizontal row, so only a modest
  // padding count is needed. At `lg`+ the grid is 4 columns wide and padded
  // out to a fixed 5 rows of slots.
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const totalSlots = isLgUp
    ? Math.max(visible.length, 5 * 4)
    : Math.max(12, visible.length);
  const emptySlotCount = totalSlots - visible.length;
  const [selectedId, setSelectedId] = useState(visible[0]?.id);
  const selected = projectItems.find((i) => i.id === selectedId) ?? visible[0];
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [sourceRect, setSourceRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  function resetExpand() {
    setExpanded(false);
    setClosing(false);
    setBackdropVisible(false);
    setSourceRect(null);
  }

  function selectFilter(next: ItemType | "all") {
    setFilter(next);
    resetExpand();
    const firstOfNext =
      next === "all"
        ? projectItems[0]
        : projectItems.find((i) => i.type === next);
    if (firstOfNext) setSelectedId(firstOfNext.id);
  }

  function selectItem(id: string) {
    setSelectedId(id);
    resetExpand();
  }

  function openExpanded() {
    const rect = detailPanelRef.current?.getBoundingClientRect();
    setSourceRect(
      rect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : null,
    );
    setClosing(false);
    setExpanded(true);
  }

  function closeExpanded() {
    const rect = detailPanelRef.current?.getBoundingClientRect();
    if (rect) {
      setSourceRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    setBackdropVisible(false);
    setClosing(true);
  }

  function handleFrameTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "transform") return;
    if (closing) resetExpand();
  }

  // FLIP animation: measure the overlay's natural ("last") position, then
  // imperatively set its transform so it visually starts at the detail
  // panel's rect (opening) or animate back down to it (closing).
  useLayoutEffect(() => {
    if (!expanded || !sourceRect || !frameRef.current) return;
    const target = frameRef.current.getBoundingClientRect();
    const scaleX = sourceRect.width / target.width;
    const scaleY = sourceRect.height / target.height;
    const translateX =
      sourceRect.left + sourceRect.width / 2 - (target.left + target.width / 2);
    const translateY =
      sourceRect.top + sourceRect.height / 2 - (target.top + target.height / 2);
    const collapsed = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

    if (!closing) {
      frameRef.current.style.transition = "none";
      frameRef.current.style.transform = collapsed;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!frameRef.current) return;
          frameRef.current.style.transition =
            "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
          frameRef.current.style.transform = "translate(0, 0) scale(1, 1)";
        });
      });
    } else {
      frameRef.current.style.transition =
        "transform 280ms cubic-bezier(0.4, 0, 1, 1)";
      frameRef.current.style.transform = collapsed;
    }
  }, [expanded, closing, sourceRect]);

  // Fade the backdrop in shortly after the frame starts expanding (a
  // separate concern from the frame/content, which stay at full opacity
  // throughout so the panel-to-overlay swap never flashes).
  useEffect(() => {
    if (!expanded || closing) return;
    const raf = requestAnimationFrame(() => setBackdropVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [expanded, closing]);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeExpanded();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  // Lock page scroll while the overlay is open (through the close
  // animation too), compensating for the scrollbar's width so the page
  // doesn't nudge sideways when it disappears.
  useEffect(() => {
    if (!expanded) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [expanded]);

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Filter tabs, like inventory category buttons */}
      <div
        role="tablist"
        aria-label="Filter by type"
        className="mb-4 flex flex-wrap gap-2"
      >
        {itemTypes.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={filter === t.id}
            onClick={() => selectFilter(t.id)}
            className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
              filter === t.id
                ? "border-editor-amber/70 text-editor-amber"
                : "border-editor-line text-editor-muted hover:text-editor-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Item slot grid */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:content-start lg:pb-0"
          role="list"
          aria-label="Inventory items"
        >
          {visible.map((item) => {
            const isSelected = item.id === selected?.id;
            return (
              <button
                key={item.id}
                role="listitem"
                onClick={() => selectItem(item.id)}
                aria-pressed={isSelected}
                title={item.name}
                className={`relative flex aspect-square w-24 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-editor-panel p-2 text-center transition-transform hover:-translate-y-0.5 sm:w-28 lg:w-auto ${
                  rarityBorder[item.rarity]
                } ${isSelected ? rarityGlow[item.rarity] : ""} ${
                  isSelected ? "ring-1 ring-editor-text/30" : ""
                }`}
              >
                {item.video && (
                  <>
                    <video
                      src={videoSrc(item.video)}
                      preload="metadata"
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover opacity-10"
                    />
                    {/* scrim keeps rarity/name text legible no matter how bright the source clip is */}
                    <div
                      className="absolute inset-0 bg-editor-panel/40"
                      aria-hidden="true"
                    />
                  </>
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wide ${rarityText[item.rarity]}`}
                  >
                    {item.rarity}
                  </span>
                  <span className="mt-1 line-clamp-3 font-mono text-[11px] leading-tight text-editor-text">
                    {item.name}
                  </span>
                </div>
              </button>
            );
          })}
          {Array.from({ length: emptySlotCount }).map((_, i) => (
            <div
              key={`empty-${i}`}
              role="listitem"
              aria-hidden="true"
              className="aspect-square w-24 shrink-0 rounded-lg border-2 border-dashed border-editor-line/30 bg-editor-panel/40 sm:w-28 lg:w-auto"
            />
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div
            ref={detailPanelRef}
            aria-hidden={expanded}
            className={`relative rounded-lg border-2 bg-editor-panel p-6 ${rarityBorder[selected.rarity]} ${
              expanded ? "invisible" : ""
            }`}
          >
            {selected.designDoc && selected.designDoc.length > 0 && (
              <button
                onClick={openExpanded}
                title="Expand full design doc"
                aria-label="Expand full design doc"
                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded border border-editor-line text-editor-muted transition-colors hover:border-editor-amber/70 hover:text-editor-amber"
              >
                <MaximizeIcon />
              </button>
            )}
            {selected.video && (
              <div className="mb-4 overflow-hidden rounded-md border border-editor-line">
                <video
                  key={selected.video}
                  src={videoSrc(selected.video, selected.previewTime)}
                  poster={selected.poster}
                  preload="metadata"
                  controls
                  playsInline
                  aria-label={`${selected.name} preview`}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-mono text-lg text-editor-text">
                  {selected.name}
                </h3>
                {selected.subtitle && (
                  <p className="mt-0.5 text-sm text-editor-muted">
                    {selected.subtitle}
                    {selected.period ? ` · ${selected.period}` : ""}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${rarityBorder[selected.rarity]} ${rarityText[selected.rarity]}`}
              >
                {selected.rarity}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-editor-muted">
              {selected.description}
            </p>

            {selected.designDoc && selected.designDoc.length > 0 && (
              <div className="mt-2 text-center">
                <button
                  onClick={openExpanded}
                  className="group relative inline-block px-3 py-1 font-mono text-xs text-editor-amber"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 rounded-tl border-l-2 border-t-2 border-editor-amber/70 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
                  />
                  <span className="inline-block transition-transform duration-200 group-hover:scale-110">
                    Expand &amp; Read More
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 rounded-br border-b-2 border-r-2 border-editor-amber/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1"
                  />
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {selected.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-editor-line px-1.5 py-0.5 font-mono text-[11px] text-editor-muted"
                >
                  {tech}
                </span>
              ))}
            </div>

            {(selected.href || selected.repo) && (
              <div className="mt-5 flex gap-4 border-t border-editor-line pt-3 font-mono text-xs">
                {selected.href && (
                  <a
                    href={selected.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-editor-amber hover:underline"
                  >
                    live →
                  </a>
                )}
                {selected.repo && (
                  <a
                    href={selected.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-editor-muted hover:text-editor-text hover:underline"
                  >
                    source →
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen design doc overlay */}
      {expanded && selected && selected.designDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={closeExpanded}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
              backdropVisible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={frameRef}
            onTransitionEnd={handleFrameTransitionEnd}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} design doc`}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg border-2 bg-editor-panel ${rarityBorder[selected.rarity]}`}
          >
            <button
              onClick={closeExpanded}
              title="Close"
              aria-label="Close design doc"
              className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded border border-editor-line bg-editor-panel/90 text-editor-muted transition-colors hover:border-editor-amber/70 hover:text-editor-amber"
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 flex items-center justify-center transition-all duration-[280ms] ease-out ${
                  closing ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              >
                <CloseIcon />
              </span>
              <span
                aria-hidden="true"
                className={`absolute inset-0 flex items-center justify-center transition-all duration-[280ms] ease-out ${
                  closing ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
                }`}
              >
                <MaximizeIcon />
              </span>
            </button>

            <div className="overflow-y-auto p-10">
              {selected.video && (
                <div className="mb-5 overflow-hidden rounded-md border border-editor-line">
                  <video
                    key={selected.video}
                    src={videoSrc(selected.video, selected.previewTime)}
                    poster={selected.poster}
                    preload="metadata"
                    controls
                    playsInline
                    aria-label={`${selected.name} preview`}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-mono text-xl text-editor-text">
                    {selected.name}
                  </h3>
                  {selected.subtitle && (
                    <p className="mt-0.5 text-sm text-editor-muted">
                      {selected.subtitle}
                      {selected.period ? ` · ${selected.period}` : ""}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${rarityBorder[selected.rarity]} ${rarityText[selected.rarity]}`}
                >
                  {selected.rarity}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-editor-muted">
                {selected.description}
              </p>

              <div className="mt-6 space-y-6">
                {selected.designDoc.map((section) => (
                  <div key={section.heading}>
                    <h4 className="font-mono text-sm uppercase tracking-wide text-editor-amber">
                      {section.heading}
                    </h4>
                    <div className="mt-2 space-y-2">
                      {section.body.map((paragraph, i) => (
                        <ReactMarkdown
                          key={i}
                          rehypePlugins={[rehypeRaw]}
                          components={designDocMarkdownComponents}
                        >
                          {paragraph}
                        </ReactMarkdown>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {selected.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-editor-line px-1.5 py-0.5 font-mono text-[11px] text-editor-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {(selected.href || selected.repo) && (
                <div className="mt-5 flex gap-4 border-t border-editor-line pt-3 font-mono text-xs">
                  {selected.href && (
                    <a
                      href={selected.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-editor-amber hover:underline"
                    >
                      live →
                    </a>
                  )}
                  {selected.repo && (
                    <a
                      href={selected.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-editor-muted hover:text-editor-text hover:underline"
                    >
                      source →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
