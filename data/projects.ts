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
  {
    id: "planet-puff",
    name: "Planet Puff",
    type: "games",
    rarity: "legendary",
    subtitle: "Game Jam Project",
    period: "July 2026 - August 2026",
    description:
      "A small puzzle platformer game where you can scale your character up and\
      down to solve a variety of platforming puzzles.",
    stack: [
      "Unreal Engine 5.8",
      "Paper2D",
      "Gameplay Ability System",
      "UMG",
      "itch.io",
    ],
    status: "shipped",
    href: "https://rndi.itch.io/planet-puff",
    video: "/video/planet-puff-demo.webm",
    poster: "/video/posters/planet-puff-demo-poster.png",
    designDoc: [
      {
        heading: "Overview",
        body: [
          `- **One-sentence pitch** — A whimsical 2D side-scroller where you grow\
          and shrink an adorable space alien to platform through levels, dodge danger,\
          and uncover hidden secrets.`,
          `- **Target audience** — All ages.`,
          `- **Platforms** — Windows only.`,
          `- **Player fantasy** — Play as a small space creature who can grow and shrink\
          to overcome obstacles no "normal-sized" hero could.`,
          `**Design pillars**:
1. **Scale as the core verb** — growing/shrinking is the primary tool for traversal and \
problem-solving.
2. **Whimsical, low-stakes tone** — cartoony visuals, playful sound design, and a death \
sequence with real dramatic flair despite the otherwise lighthearted world.
3. **Tight moment-to-moment feedback** — nearly every player action (jump, land, scale, \
take damage, collect) has dedicated audio/visual response tuned specifically for it.
4. **Consistent presentation everywhere** — resolution-independent camera and UI framing, \
so the experience looks and plays the same regardless of the player's screen.
5. **Light collection/completion layer** — coins and hidden stars reward exploration \
without demanding it.`,
          `**Non-goals:**

- Not multiplayer or networked (confirmed single-player only, no replication).
- No deep combat system — the player has no attack mechanic (see *Systems (rules) → Combat*).
- No permanent meta-progression for challenge stars — collection is per-playthrough, \
not saved long-term (by design decision made in development).`,
        ],
      },
      {
        heading: "Core gameplay",
        body: [
          `**Core loop:**

Enter a stage -> platform through it using movement, jumping, and (once unlocked) the scale \
ability -> collect coins for score and optional hidden stars -> avoid or survive enemy damage \
-> reach the level-end door before the stage timer runs out -> proceed to the next stage \
(or Credits, if it's the final one).`,
          `**Controls summary:**

| Action | Input |
|---|---|
| Move Left / Move Right | \`A\` / \`D\` |
| Jump | \`Space\` |
| Scale Up / Down | Hold \`Shift\`, Hold \`Ctrl\` |
| Interact | \`W\` Context-sensitive (e.g., stage-end door) |`,
          `**Win/lose conditions:**

- **Win (stage):** reach the level-end door before the countdown timer expires.
- **Lose (death):** player health reaches 0 -> scripted death sequence -> Retry or Main Menu.
- **Lose (timeout):** stage timer reaches 0 -> player takes damage equal to current health \
-> player health reaches 0 -> scripted death sequence -> Retry or Main Menu.`,
          `**Game modes:**

Single default stage-based playthrough.`,
        ],
      },
      {
        heading: "Systems (rules)",
        body: [
          `### Movement

Standard grounded 2D side-scroller movement (walk, jump). The scale ability changes the \
character's collision size and visual scale, with position compensation to keep the \
character grounded (feet don't sink/float) during the transition.`,
          `### Combat
- Enemies can damage the player on contact with the main capsule collider or hurtbox \
extensions such as the front and back sphere colliders towards the bottom of the \
character.
- The player has **no means of dealing damage back** — no attack input, \
weapon, or offensive abilities.
- A brief invulnerability window follows any hit taken, preventing instant multi-hit deaths.`,
          `### Progression

The Scale ability — the game's core mechanic — is not available at the start; it's \
granted mid-game via a collectible power-up. The scale ability allows the player to \
overcome obstacles found later in the game.`,
          `### Economy

Coins are collected for score (100 points each). Coins function purely as a scoring \
mechanic. Stars can be collected for 2000 points each. Each second remaining on the \
level timer is worth 100 points each.`,
          `### AI

One baseline enemy type exists, capable of damaging the player on contact. This enemy \
moves forward until it hits a wall or an edge, then turns around and repeats the \
same behavior.`,
          `### Difficulty and balancing notes

- Jumps serve as the primary difficulty lever in this game. Jumps start out easy \
with more difficult jumps required for optional content. After the player has \
acquired the scale ability, some jumps become impossible to do at the default \
size. This teaches the player when and how to use the scale ability. The hardest \
jumps are placed near the end of the level which combine difficult jumps with \
required usage of the scale ability.
- The stage timer creates time pressure as a secondary difficulty lever.
- Post-damage invulnerability prevents unfair rapid-fire death.`,
        ],
      },
      {
        heading: "Content",
        body: [
          `**Levels / maps:**

Built with Paper2D tile maps. The only level includes: a stage timer, scattered \
coins, 3 hidden challenge stars, at least one Scale Power-Up, and a level-end \
door.`,
          `**Characters / classes:**

Single playable character — a round yellow alien in a bubble space helmet.`,
          `**Enemies:**

One baseline enemy (worm) type (contact damage).`,
          `**Items:**

- **Scale Power-Up** — grants the core ability; spawns an explanatory tip on pickup.
- **Coins** — score pickups (100 pts each).
- **Challenge Stars** — 3 per level, optional/completionist collectibles.`,
        ],
      },
      {
        heading: "UX and UI",
        body: [
          `**Player journey (flow):**

\`\`\`
Main Menu -> Start -> Stage 1 -> Credits (skippable) → Main Menu
                        ↓ (death)
                Game Over Menu → Retry (reloads stage) / Main Menu
Main Menu → Credits (direct access)
Main Menu → Exit (quits application)
\`\`\``,
          `**HUD requirements:**

| Element | Position | Status |
|---|---|---|
| Heart health display | Upper-left | Implemented, shakes on damage |
| Stage countdown timer | Upper-center | Implemented, sprite-based digits |
| Score counter | Upper-right | Implemented, sprite-based digits |
| Challenge star tracker | Upper-left (under heart health display) | Implemented, \
starts with empty visuals and fills out with a star graphic when the respective \
star is collected|

All HUD elements are built to remain correctly framed regardless of the player's screen resolution or window shape.`,
          `**Menus:**

- **Main Menu** — Start, Credits, Exit
- **Game Over Menu** — Retry Level, Main Menu
- **Credits screen** — auto-scrolls, hold \`Space\` to fast-forward, shows a "To Main Menu" button once finished`,
          `**Accessibility:**
No accessibility features.`,
        ],
      },
      {
        heading: "Production",
        body: [
          `**Milestones:**

*Not formally defined*, but based on completed work, the following represent validated technical milestones:

- Core scale mechanic (movement, ground compensation, audio feedback) — ✅ complete
- Health/damage/death sequence — ✅ complete
- HUD (health, timer, score, stars) — ✅ complete
- Camera system (bounded, resolution-independent) — ✅ complete
- Credits (HUD animation and player/stage scripting) — ✅ complete
- Packaging & distribution pipeline (Windows, itch.io) — ✅ validated`,
          `**Dependencies:**

- Unreal Engine 5.8
- Paper2D plugin (built-in, must be enabled)
- Gameplay Ability System plugin (built-in, must be enabled)
- Microsoft Visual C++ 2015–2022 Redistributable (end-user runtime dependency)
- itch.io (current distribution platform)`,
        ],
      },
      {
        heading: "Marketing and monetization",
        body: [
          `**Positioning:**
A cozy, whimsical platformer distinguished by its scale-shifting mechanic — \
leaning into charm and clever traversal puzzles over difficulty or combat depth. \
Meant for people of all ages.`,
          `**Competitors:**
Any platformers meant for people of all ages like Super Mario for example.`,
          `**Pricing / business model:**
Free to download at https://rndi.itch.io/planet-puff.`,
        ],
      },
    ],
  },
];
