# ProtoGrid

Engineering / prototyping / fabrication studio. Turns an idea, task, or raw concept into a real, working product or part.

---

## What this is

ProtoGrid is a custom fabrication and rapid prototyping service. Clients come with a problem — an idea, a broken part, a rough sketch — and get back a working prototype, functional component, or small-batch production run.

Not a CAD service. Not a "CNC website". A physical result service.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Syne (display), DM Mono (UI/technical) via @fontsource |
| Animation | Framer Motion |
| Icons | Lucide React |
| UI components | shadcn/ui — added per component as needed |
| Forms | Next.js Server Actions → email (v1) |
| Data | Hardcoded content (v1), no database |
| Deploy | Render |

---

## Current status

| Section | Status |
|---|---|
| Project setup | Done — Next.js 16, Tailwind v4, fonts, design tokens |
| Design system | Defined — colors, typography, spacing, motion rules |
| Hero | Built — `src/components/hero/` |
| Navbar | Specified — ready to build |
| Remaining sections | Not started |

---

## Development plan

Sections are built one at a time. Spec first, then implement, then lock before moving on.

**Build order:**
1. ~~Project setup~~ — done
2. ~~Hero~~ — done
3. Navbar
4. What we do (service cards)
5. Who it's for
6. How it works
7. Why ProtoGrid
8. Projects / case studies
9. Materials & capabilities
10. FAQ
11. Contact form
12. Footer

**Content language:** English-first. Norwegian localisation is added after the English version is complete.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # lint check
```

---

## Design tokens

Defined in `src/app/globals.css` via Tailwind v4 `@theme inline`:

| Token | Hex | Usage |
|---|---|---|
| `ink-shadow` | `#1E2028` | Background |
| `iris-dusk` | `#5C5F7A` | Borders, muted elements |
| `lavender-smoke` | `#8E90A6` | Secondary text, placeholders |
| `cold-pearl` | `#F1F2F4` | Primary text, primary CTA background |

Available as Tailwind utilities: `bg-ink-shadow`, `text-cold-pearl`, `border-iris-dusk`, etc.

---

## Font setup

Fonts are self-hosted via `@fontsource` — no Google Fonts dependency.

| Font | Package | Tailwind class |
|---|---|---|
| Syne | `@fontsource/syne` | `font-display` |
| DM Mono | `@fontsource/dm-mono` | `font-technical` |
| System sans | — | `font-sans` |

---

## Deployment

Deployed on **Render** as a Node.js web service.

Build command: `npm run build`  
Start command: `npm start`  
Node version: 22+
