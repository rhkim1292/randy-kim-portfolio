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
  // One or more Markdown blocks (bold/italic/links/inline code/lists supported).
  // Each string renders as its own Markdown block, so put a whole bulleted
  // list ("- item\n- item") in a single string rather than one item per entry.
  body: string[];
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
          "When I started working for ASTI, I noticed the company was spending much more than\
          necessary to keep their website running. They were paying for a CMS that seemed\
          overkill for the type of website they were hosting. I proposed to the owner I could\
          save him $312/year by remaking the website and hosting it on vercel for free. All\
          he would need to pay for is the domain name (at $46/year) and so I set out to replicate\
          the existing website making it much more lightweight and modern in the process.",
        ],
      },
      {
        heading: "Features implemented",
        body: [
          `- **Hand-rolled image lightbox** — built from scratch with no library:\
          Escape-to-close, backdrop-click dismissal, scroll locking, and proper listener\
          cleanup, reused across the gallery and portfolio.`,
          `- **Pinterest-style masonry gallery** — ~90 real project photos laid out with\
          CSS Grid (\`grid-flow-dense\`), per-image span metadata driving variable tile\
          sizes, and computed aspect ratios, no gallery library.`,
          `- **Full contact/quote pipeline with file uploads** — validates ~60 allowed\
          design-file types (.ai, .psd, .dwg, .indd, etc.), enforces size and file-count\
          limits, and sends a styled HTML email via Resend with attachments and \`replyTo\`\
          set to the customer.`,
          `- **Config-driven navigation** — nav structure lives in one config object\
          consumed by separate desktop/mobile/dropdown components, including a custom\
          hover-delay hook and an accessible mobile drawer.`,
          `- **Five dedicated product pages** — channel letters, cabinet signs, banners,\
          LED signs, and interior signs, each with unique imagery and copy instead of\
          one generic template.`,
          `- **Custom carousel controls** — \`react-slick\` wrapped with custom\
          play/pause and prev/next controls via an imperative ref API.`,
          `<video src="/video/asti-carousel-demo.webm"></video>`,
          `- **Performance and SEO polish** — \`next/image\` throughout with tuned\
          quality levels, \`next/font/google\` with \`display: swap\`, per-page\
          metadata, and Vercel Analytics/Speed Insights wired in.`,
          `- **Data-driven content** — gallery, portfolio, and product content are\
          structured arrays rather than hardcoded markup, so new projects can be added\
          without touching layout code.`,
        ],
      },
      {
        heading: "Technical notes",
        body: [
          `- **Next.js App Router over Pages Router / a static site generator** — \
          server-rendered React with file-based routing gets SEO-friendly pages\
          (metadata API, server components) and API routes in one framework, no\
          separate backend needed for the contact form. For a marketing site where\
          most content is static but one dynamic endpoint (email + file upload) is\
          needed, App Router's Route Handlers avoid standing up Express or serverless\
          functions elsewhere.`,
          `- **No CMS — content lives as JS data structures in the codebase** —\
          \`package.json\` has zero CMS dependencies (no Sanity, Contentful, MDX);\
          gallery/portfolio/product content is hardcoded arrays of objects. **Why**:\
          this is a small, infrequently-updated business site — a CMS adds hosting\
          cost, an admin UI to maintain, and a runtime dependency for content that\
          changes maybe a few times a year. Content-as-code means new sign photos\
          ship through the same git workflow as everything else, get type/lint-checked,\
          and cost nothing extra to host.`,
          `- **Resend for email instead of a form-as-a-service\
          (Formspree, Netlify Forms)** — **Why**: form services are fine for a plain\
          contact field, but this form needs file attachments (design files up to 10MB,\
          5 files) forwarded to the business's inbox with the customer set as\
          \`replyTo\`. Resend's API plus a Next.js Route Handler gives full control over\
          validation, attachment handling, and email formatting — something most\
          forms-as-a-service either can't do or charge extra for.`,
        ],
      },
      {
        heading: "Challenges",
        body: [
          `- **Email spam bots** — When the email form was first implemented, a lot of\
          spam submissions were coming through. After doing some research on how to\
          combat the bots, a commonly used solution was to hide an input field that would\
          prevent submission if filled out. Bots would fill this input field out whereas\
          there was no way humans would be able to. This technique is called the\
          honeypot input field. After implementing this to the ASTI email form, most\
          if not all spam emails have been impeded from submission.`,
        ],
      },
    ],
  },
];
