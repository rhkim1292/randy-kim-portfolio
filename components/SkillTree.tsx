"use client";

import { useState } from "react";
import { skillBranches, skills } from "@/data/talents";

const accentText: Record<string, string> = {
  amber: "text-editor-amber",
  teal: "text-editor-teal",
  violet: "text-editor-violet",
  rose: "text-editor-rose",
};

const accentBorder: Record<string, string> = {
  amber: "border-editor-amber/60",
  teal: "border-editor-teal/60",
  violet: "border-editor-violet/60",
  rose: "border-editor-rose/60",
};

function Pips({ level, accent }: { level: number; accent: string }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < level ? `${accentText[accent]} bg-current` : "bg-editor-line"
          }`}
        />
      ))}
    </span>
  );
}

export default function SkillTree() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
      {skillBranches.map((branch) => {
        const branchSkills = skills.filter((s) => s.branchId === branch.id);
        return (
          <div key={branch.id}>
            <h3
              className={`mb-3 font-mono text-xs uppercase tracking-wide ${accentText[branch.accent]}`}
            >
              {branch.label}
            </h3>

            <div
              className={`relative border-l-2 pl-4 ${accentBorder[branch.accent]}`}
            >
              <ul className="space-y-3">
                {branchSkills.map((skill) => {
                  const isOpen = openId === skill.id;
                  return (
                    <li key={skill.id} className="relative">
                      <span
                        className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-current ${accentText[branch.accent]}`}
                        aria-hidden
                      />
                      <button
                        onClick={() => setOpenId(isOpen ? null : skill.id)}
                        aria-expanded={isOpen}
                        className="w-full rounded border border-editor-line bg-editor-panel px-3 py-2 text-left transition-colors hover:border-editor-muted/60"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm text-editor-text">
                            {skill.name}
                          </span>
                          <Pips level={skill.level} accent={branch.accent} />
                        </div>
                        {isOpen && (
                          <p className="mt-2 text-xs leading-relaxed text-editor-muted">
                            {skill.description}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
