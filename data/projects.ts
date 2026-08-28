// Edit this file to add your real jobs and projects.
// `rarity` is purely visual (border color / glow) — use it to signal your
// best or most senior work as "legendary" so it stands out in the grid.

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type ItemType = "games" | "websites";

export const itemTypes: { id: ItemType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "games", label: "Games" },
  { id: "websites", label: "Websites" },
];

export type ProjectItem = {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  subtitle?: string; // company name, or role
  period?: string; // "2023 — Present"
  description: string;
  stack: string[];
  href?: string;
  repo?: string;
  status?: "shipped" | "in progress" | "archived";
};

export const projectItems: ProjectItem[] = [
  {
    id: "asti-website",
    name: "ASTI Website",
    type: "websites",
    rarity: "epic",
    subtitle: "Advanced Sign Tech Inc.",
    period: "2025 — Present",
    description:
      "This is a professional website I built for ASTI, a sign manufacturing company. It showcases their products and services, and serves as a portfolio for their work.",
    stack: ["Next.js", "Tailwind CSS", "Lucide React", "Vercel", "Resend"],
    status: "shipped",
    href: "https://www.advancedsigntech.com/"
  },
];
