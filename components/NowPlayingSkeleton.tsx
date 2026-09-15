// Dashed-placeholder card for sanity-checking the Now Playing section's
// layout before real data is wired in — same wrapper/eyebrow as the real
// section, but the card itself borrows the empty-slot idiom from
// InventoryLog.tsx (border-2 border-dashed border-editor-line/30
// bg-editor-panel/40) instead of rendering actual track data. Unused at
// runtime in the finished hybrid; mount it temporarily wherever you want to
// screenshot the layout.
export default function NowPlayingSkeleton() {
  return (
    <section
      aria-label="Currently playing music"
      className="border-b border-editor-line px-4 py-6 sm:px-6"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-editor-muted">
        Now Playing
      </p>

      <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-editor-line/30 bg-editor-panel/40 p-4">
        <div className="h-16 w-16 shrink-0 rounded border-2 border-dashed border-editor-line/30 bg-editor-panelAlt/40 sm:h-20 sm:w-20" />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-16 rounded-full bg-editor-line/30" />
          <div className="h-4 w-2/3 rounded-full bg-editor-line/30" />
          <div className="h-3 w-1/3 rounded-full bg-editor-line/30" />
          <div className="mt-2.5 h-1 w-full rounded-full bg-editor-line/30" />
        </div>
      </div>
    </section>
  );
}
