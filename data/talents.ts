// Edit this file to reflect your real skills. `level` is 1-5 and drives
// the filled-pip display. `branch` groups skills into columns on the talent
// tree — rename branches to whatever categories make sense for you.

export type SkillBranch = {
  id: string;
  label: string;
  accent: "amber" | "teal" | "violet" | "rose";
};

export type Skill = {
  id: string;
  name: string;
  branchId: string;
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
};

export const skillBranches: SkillBranch[] = [
  { id: "engines", label: "Engines", accent: "amber" },
  { id: "languages", label: "Languages", accent: "teal" },
  { id: "systems", label: "Systems", accent: "violet" },
  { id: "tools", label: "Tools & Pipeline", accent: "rose" },
];

export const skills: Skill[] = [
  {
    id: "unreal",
    name: "Unreal Engine",
    branchId: "engines",
    level: 4,
    description:
      "Replace with your real proficiency notes — years of use, biggest project, favorite subsystem (Gameplay Ability System, replication, etc).",
  },
  {
    id: "unity",
    name: "Unity",
    branchId: "engines",
    level: 3,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "godot",
    name: "Godot",
    branchId: "engines",
    level: 2,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "cpp",
    name: "C++",
    branchId: "languages",
    level: 4,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "csharp",
    name: "C#",
    branchId: "languages",
    level: 4,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "typescript",
    name: "TypeScript",
    branchId: "languages",
    level: 3,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "gameplay-ability-system",
    name: "Gameplay Ability System",
    branchId: "systems",
    level: 3,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "networking",
    name: "Multiplayer & Replication",
    branchId: "systems",
    level: 3,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "ai-behavior",
    name: "AI & Behavior Trees",
    branchId: "systems",
    level: 2,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "git",
    name: "Git / Perforce",
    branchId: "tools",
    level: 4,
    description: "Replace with your real proficiency notes.",
  },
  {
    id: "ci-cd",
    name: "CI/CD Pipelines",
    branchId: "tools",
    level: 2,
    description: "Replace with your real proficiency notes.",
  },
];
