# Portfolio Starter

A Next.js (App Router + TypeScript + Tailwind) portfolio styled like an open
code editor, with an RPG layer on top: your work history is an **inventory**
and your skills are a **talent tree**.

Three pages: `/` (overview + character sheet), `/experience` (inventory log
of jobs and projects), `/talents` (skill tree).

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 2. Make it yours

- **`data/experience.ts`** — your jobs and projects as inventory items.
  Set `rarity` (`common` / `rare` / `epic` / `legendary`) to control visual
  weight — reserve `legendary` for your strongest, most senior work so it
  actually stands out.
- **`data/talents.ts`** — your skills, grouped into branches (columns) with
  a 1–5 proficiency level.
- **`components/Hero.tsx`** — swap in your name, bio, and contact links.
- **`components/CharacterSheet.tsx`** — the class/guild/status summary strip
  on the homepage.
- **`components/Terminal.tsx`** — footer links (GitHub repo, year is
  automatic).
- **`app/layout.tsx`** — page `<title>` and meta description.
- **`tailwind.config.ts`** — the `editor.*` color tokens if you want to
  change the palette (currently a dark slate background with amber / teal /
  violet / rose accents).

## Design notes

- All talent-tree descriptions are revealed by clicking the node — nothing
  is gated behind "unlocking" a prerequisite. A recruiter should never have
  to figure out game mechanics to read your skills.
- The inventory grid and detail panel are two panes rather than a modal, so
  browsing stays fast and nothing traps keyboard focus.
- There's no forced "explore the world" navigation — moving between
  Overview / Experience / Talents is a plain top nav, so it stays scannable
  for someone skimming quickly.

## 3. Put it in Git / GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create portfolio --public --source=. --push
```

(No `gh` CLI? Create an empty repo on github.com, then:)

```bash
git remote add origin https://github.com/yourname/portfolio.git
git branch -M main
git push -u origin main
```

## 4. Deploy on Vercel

**Easiest — via the dashboard:**
1. Go to https://vercel.com/new
2. Import the GitHub repo you just pushed
3. Leave the defaults (Vercel auto-detects Next.js) → Deploy

**Or via CLI:**
```bash
npm i -g vercel
vercel
```

Every push to `main` will auto-deploy after this. For a custom domain, add
it under Project → Settings → Domains in the Vercel dashboard.

## Cost

- Vercel hobby tier: free for a personal portfolio site
- GitHub: free for public (or private) repos
- Custom domain (optional): ~$10–12/year from a registrar like Namecheap,
  Porkbun, or Cloudflare Registrar
