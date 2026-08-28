export default function EditorChrome() {
  return (
    <div className="flex items-center gap-2 border-b border-editor-line bg-editor-panel px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-editor-rose/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-editor-amber/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-editor-teal/70" />
      <span className="ml-3 font-mono text-xs text-editor-muted">
        ~/randy-kim/personal-site.tsx
      </span>
    </div>
  );
}
