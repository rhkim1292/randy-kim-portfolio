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

export type DesignDocSection = {
  heading: string;
  body: string[]; // one or more paragraphs (or manually-bulleted lines)
};

export type ProjectItem = {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  subtitle?: string; // company name, or role
  period?: string; // "2023 — Present"
  description: string; // brief blurb shown in the detail panel
  stack: string[];
  href?: string;
  repo?: string;
  status?: "shipped" | "in progress" | "archived";
  video?: string; // path under /public, or a full URL — .webm clip
  previewTime?: number; // seconds — which frame to show while paused
  poster?: string; // optional static image shown instead of a video frame
  // Longer-form write-up (features implemented, architecture, challenges,
  // etc.) shown only in the full-screen expanded view — omit to disable
  // the expand control for that item.
  designDoc?: DesignDocSection[];
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
    href: "https://www.advancedsigntech.com/",
    video: "/video/asti-demo.webm",
    poster: "/video/posters/asti-demo-poster.png",
    // Placeholder — replace with the real design-doc write-up.
    designDoc: [
      {
        heading: "Overview",
        body: [
          "Replace with a longer summary of the project: the problem it solved, who it was for, and your role.",
        ],
      },
      {
        heading: "Features implemented",
        body: [
          "Replace with specific features, one per line, e.g. product catalog with filtering.",
          "Contact form with server-side email delivery via Resend.",
          "Responsive layout tuned for mobile storefront browsing.",
        ],
      },
      {
        heading: "Technical notes",
        body: [
          "Replace with architecture/stack decisions worth calling out, and why you made them.",
        ],
      },
      {
        heading: "Challenges",
        body: [
          "Replace with a notable problem you hit and how you solved it.",
        ],
      },
    ],
  },
];
