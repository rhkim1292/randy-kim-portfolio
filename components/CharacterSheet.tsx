const stats = [
  { label: "Role", value: "Sign Manufacturer" },
  { label: "Company", value: "ASTI" },
  { label: "Years", value: "3" },
];

export default function CharacterSheet() {
  return (
    <div className="flex gap-px overflow-hidden rounded-lg border border-editor-line bg-editor-line"
    /*"grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-editor-line bg-editor-line sm:grid-cols-4"*/>
      {stats.map((stat) => (
        <div key={stat.label} className="bg-editor-panel px-4 py-3 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-wide text-editor-muted">
            {stat.label}
          </p>
          <p className="mt-1 truncate font-mono text-sm text-editor-text">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
