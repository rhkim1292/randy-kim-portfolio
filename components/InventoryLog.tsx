"use client";

import { useState } from "react";
import {
  projectItems,
  itemTypes,
  type ItemType,
  type Rarity,
} from "@/data/projects";

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

export default function InventoryLog() {
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const visible =
    filter === "all"
      ? projectItems
      : projectItems.filter((i) => i.type === filter);
  const [selectedId, setSelectedId] = useState(visible[0]?.id);
  const selected =
    projectItems.find((i) => i.id === selectedId) ?? visible[0];

  function selectFilter(next: ItemType | "all") {
    setFilter(next);
    const firstOfNext =
      next === "all"
        ? projectItems[0]
        : projectItems.find((i) => i.type === next);
    if (firstOfNext) setSelectedId(firstOfNext.id);
  }

  return (
    <div className="p-4 sm:p-6">
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
          className="grid grid-cols-3 gap-2 content-start sm:grid-cols-4"
          role="list"
          aria-label="Inventory items"
        >
          {visible.map((item) => {
            const isSelected = item.id === selected?.id;
            return (
              <button
                key={item.id}
                role="listitem"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={isSelected}
                title={item.name}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border-2 bg-editor-panel p-2 text-center transition-transform hover:-translate-y-0.5 ${
                  rarityBorder[item.rarity]
                } ${isSelected ? rarityGlow[item.rarity] : ""} ${
                  isSelected ? "ring-1 ring-editor-text/30" : ""
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-wide ${rarityText[item.rarity]}`}
                >
                  {item.rarity}
                </span>
                <span className="mt-1 line-clamp-3 font-mono text-[11px] leading-tight text-editor-text">
                  {item.name}
                </span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="col-span-full py-8 text-center font-mono text-sm text-editor-muted">
              // nothing in this slot yet
            </p>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div
            className={`rounded-lg border-2 bg-editor-panel p-5 ${rarityBorder[selected.rarity]}`}
          >
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
    </div>
  );
}
