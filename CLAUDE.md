# CLAUDE.md — protogrid

Working document for AI-assisted development. No fluff.

---

## Goal

Build a high-quality product together, step by step.
Priority: clean UI/UX, maintainable code, thoughtful structure.
No rushing. No premature architecture.

---

## Principles of Changes

- **Analyze before acting.** Read relevant files first. Understand the context.
- **Minimal footprint.** Change only what the task requires. Nothing more.
- **Don't break existing.** Before touching working code, understand why it works.
- **Step by step.** Propose changes in small, reviewable increments.
- **Ask if unclear.** Don't invent requirements. Clarify before generating.

---

## Work Style

- Read the file before editing it.
- One task = one focused change. Don't bundle unrelated fixes.
- Don't add abstractions, helpers, or utilities "just in case."
- Don't add error handling for impossible scenarios.
- Don't refactor surrounding code unless the task explicitly requires it.
- Don't add comments to code you didn't write.
- Don't use emojis unless asked.

---

## Rules Before Generating Code

1. Confirm the task scope is clear.
2. Read all relevant files.
3. Identify what currently exists — don't duplicate.
4. State the approach in one sentence before starting.
5. If multiple approaches exist, name them briefly and ask which to take.
6. If a change touches UI — consider visual consistency and UX impact before writing.

---

## Reuse Before Custom Build

Do not implement common application infrastructure from scratch.

**Always prefer proven libraries for:**
- Authentication → use a standard auth library (e.g. NextAuth, Clerk, Lucia)
- Forms → React Hook Form + Zod
- Validation → Zod
- UI components → shadcn/ui first, then Radix UI primitives
- Tables, dialogs, file uploads, date pickers, editors → established libraries
- Email flows → Resend, Nodemailer, or similar
- Storage → existing service SDKs
- Role-based access → library-level, not hand-rolled
- Billing → Stripe SDK

**Write custom code only for:**
- Project-specific business logic
- Domain-specific workflows (e.g. quote flow, fabrication order steps)
- Custom layout, brand presentation, and design system details
- Integrations not covered by existing tools

**Before implementing any complex feature:**
Check whether it should be assembled from established libraries instead of coded from scratch. If a library handles 80%+ of the requirement, use it.

---

## Working with UI/UX

- Consistency first: spacing, typography, color, interaction patterns must feel unified.
- Don't introduce new visual patterns without reason.
- When building components: think about states (empty, loading, error, disabled, active).
- Prefer accessible markup (semantic HTML, ARIA where needed).
- Animations and transitions should serve the user, not decorate.
- When reviewing UI code: read it as a user would experience it, not just as markup.

---

## Working with Skills

Installed skills and when to use them:

| Skill | Trigger | Use when |
|---|---|---|
| `massgen` | `/massgen` | Running complex tasks with multiple AI agents in parallel — agents critique each other's work and vote on the best solution |
| `frontend-design` | `/frontend-design` | Starting any UI work — forces design thinking (structure, layout, states) before writing a single line of code |
| `brand-guidelines` | `/brand-guidelines` | Defining or enforcing brand colors, fonts, spacing, tone — keeps visual identity consistent across all output |
| `theme-factory` | `/theme-factory` | Generating a color palette + font pairing for the project; pick from 10 ready themes or generate a custom one |
| `skill-creator` | `/skill-creator` | Creating a new custom skill — for project-specific workflows, design system rules, or repeated task patterns |
| `graphify` | `/graphify` | Visualizing codebase structure, understanding module connections, exploring a new part of the project |
| `simplify` | `/simplify` | After writing code — review for quality, redundancy, and efficiency |
| `update-config` | — | Changing Claude Code settings, hooks, permissions, or env vars |

To run graphify on the current directory:
```
/graphify .
```

---

## Communication Format

- **Short answers by default.** Long explanations only when complexity demands it.
- **Before acting:** one line describing what you're about to do.
- **After acting:** one line summarizing what changed and why.
- **If blocked:** say what's missing and what's needed to unblock.
- **Proposals:** list options briefly, don't pick one without asking.
- **No filler phrases.** ("Great question!", "Certainly!", "Of course!" — skip these.)

---

## Git

- Branch: never push directly to `main`.
- Commits: imperative, focused (`Add login form`, not `changes`).
- No `git add -A` — stage files by name.
- No `--no-verify` unless explicitly instructed.
- Don't create PRs unless asked.

---

## Project: ProtoGrid

**One-line definition:** Engineering / prototyping / fabrication studio — turns an idea, task, or raw concept into a real, working product or part.

**Core logic:** Client comes with a problem, not a spec. ProtoGrid takes it through the full cycle:
```
request → task analysis → solution selection → prototype → test → production → repeatable products
```

**What it is NOT:** a CAD service, a "CNC website", a digital-only offering.

**What it IS:** a physical result service — custom fabrication, rapid prototyping, small-batch production.

**Growth path:**
1. Custom orders — first revenue, real cases
2. Accumulate cases — understand demand patterns
3. Extract repeatable solutions from custom work
4. Launch own product lines
5. Scale as a brand, not just a hands-on service

**Target clients:** individual makers, small businesses, local production needs, DIY / hobby / workshop segment.

**Key capabilities:**
- CNC fabrication
- Part prototyping and enclosures
- Small-batch runs
- Redesign / replacement of existing parts
- Idea-to-object support

---

## Site Structure

### Navigation (all pages)

```
Home | Services | Process | Projects | About | Contact    [Request a Quote →]
```

### Page: Home — block order

| # | Section | Purpose |
|---|---|---|
| 1 | **Hero** | Headline + subline + 2 CTAs + visual (render/photo, not stock) |
| 2 | **What we do** | 4 service cards: Custom Parts, Prototyping, Part Redesign, Small-Batch |
| 3 | **Who it's for** | 6 client types — let visitor self-identify |
| 4 | **How it works** | 5 steps: Send task → Review → Prototype → Production → Delivery |
| 5 | **Why ProtoGrid** | 4–6 honest reasons, no superlatives |
| 6 | **Projects** | Case study cards: task / solution / result / photo |
| 7 | **Materials & Capabilities** | Input formats accepted + what you can deliver |
| 8 | **FAQ** | 7–8 questions, removes pre-sale friction |
| 9 | **Contact form** | Name, email, task description, dimensions, deadline, file upload |
| 10 | **Footer** | Logo, one-liner, links, email, socials, copyright |

### Multipage structure

- **Home** — short version of everything, full-page CTA flow
- **Services** — 4 service pages: Custom Parts / Prototyping / Redesign / Small-Batch
- **Process** — full step-by-step walkthrough
- **Projects** — case studies grid
- **About** — who, how, engineering mindset (no biography wall)
- **Contact** — form + contacts

### Minimal launch version (if shipping fast)

Hero → Services → Process → Projects → Contact → Footer. That's enough to go live.

### Hero copy direction

- Headline: `From concept to functional product`
- Sub: `ProtoGrid turns ideas, sketches, broken parts, and custom requirements into prototypes, functional components, and small-batch production.`
- CTAs: `Request a Quote` + `See How It Works`

### What NOT to put on this site

- Mission/vision/values wall
- Stock photos of people in hard hats
- Excessive animations
- Fake testimonials
- Vague phrases like "innovative future solutions"
- "Why we are the best" framing
- Complex quote calculator on first load

### The 4 questions the site must answer

1. What do you do?
2. Who is it for?
3. How does it work?
4. How do I send my task?

If all four are answered clearly — the structure is correct.

---

## Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React

**Deploy:** Render

**Forms (v1):** Next.js Server Actions or API route → email

**Data (v1):** no database — content hardcoded in files

**Later:**
- Supabase or PostgreSQL + Prisma
- File uploads
- Admin panel
- Order/request tracking

---

## Global UI System

### Container & Layout
- Max width: `max-w-7xl` (1280px) for all sections
- Narrow content (text, forms): `max-w-[800px]`
- Padding: `px-6 lg:px-8`
- Layout system: CSS Grid for section splits; Flexbox only for inline alignment
- Standard splits: 55/45, 50/50, 1/3+2/3, full-width

### Section Spacing
- Default: `py-24 lg:py-32`
- Tight / related sections: `py-16 lg:py-24`
- Intra-section element gaps: `mb-4` / `mb-6` / `mb-10` — same tokens as Hero
- No ad-hoc spacing values

### Border Rules
- Always `1px solid`
- Color: `--iris-dusk` at `15–50%` opacity (structural: 20–35%, interactive hover: 50–70%)
- No thick borders, no colored accent borders

### Radius Rules
- Buttons, cards, inputs: `rounded-sm` (2px)
- Tags / badges: `rounded-full` only for small inline labels
- No `rounded-lg` or `rounded-xl` on structural elements

### Button System
| Variant | Style |
|---|---|
| Primary | `bg-cold-pearl text-ink-shadow h-12 px-6 rounded-sm font-technical text-[13px] tracking-[0.06em]` — hover dims bg |
| Secondary | `border border-iris-dusk text-lavender-smoke` — hover: `border-lavender-smoke text-cold-pearl` |
| Tertiary | No border, no bg, `text-lavender-smoke` — hover: `text-cold-pearl` |

No shadow. No scale on click. CSS transitions only on hover (`duration-150`).

### Heading Scale
| Level | Size | Font | Weight | Leading | Tracking |
|---|---|---|---|---|---|
| Display | `clamp(42px,6vw,72px)` | Syne | 700 | 1.05 | −0.02em |
| H1 | `clamp(32px,4vw,52px)` | Syne | 700 | 1.08 | −0.02em |
| H2 | `clamp(24px,3vw,40px)` | Syne | 700 | 1.10 | −0.01em |
| H3 | `20–24px` | Syne | 600 | 1.20 | 0 |
| H4 / eyebrow | `11–13px` | DM Mono | 500 | — | +0.12–0.18em |

### Body Text Scale
| Context | Size | Leading |
|---|---|---|
| Large body | 17px | 1.70 |
| Default body | 15–16px | 1.65 |
| Caption / small | 13px | 1.50 |
| Label / eyebrow | 11px, DM Mono, uppercase | — |

### Card Style
- Border: `1px solid iris-dusk/25–30%`
- Background: transparent — no elevation, no shadow
- Padding: `p-6`
- Radius: `rounded-sm` or none
- Hover: border opacity increases to `50–60%`

### Input Style
- Height: `h-12`; radius: `rounded-sm`
- Border: `1px solid iris-dusk/40%`; bg: transparent
- Text: cold-pearl; placeholder: `lavender-smoke/50%`
- Focus: border shifts to lavender-smoke — no glow, no shadow
- Label: `11px DM Mono uppercase tracking-[0.12em]`

### Dividers
- `1px solid iris-dusk/20%`
- Use only between major content blocks
- Prefer generous spacing over drawn lines

### Dark Theme
- Background: `#1E2028` always
- Text: Cold Pearl (primary) → Lavender Smoke (secondary) → Iris Dusk (muted/borders)
- No pure white, no pure black, no light mode in v1

### Motion Rules
- Scroll entrance: `whileInView` + `once: true` + `viewport={{ margin: "-80px" }}`
- Entrance animation: `opacity 0→1`, `y -12→0`
- Easing: `[0.16, 1, 0.3, 1]` everywhere
- Duration: `0.45–0.6s`; stagger: `0.08–0.12s`
- Hover: CSS `transition` only, `150–200ms` — no Framer Motion on hover
- No looping, no bounce, no decorative float/pulse

---

## Navbar Spec

**Structure:** `[Logo]` — `[Nav links]` — `[Request a Quote]`

**Visual**
- Height: `h-16` (64px); position: `sticky top-0 z-50`
- Base: `bg-ink-shadow border-b border-iris-dusk/20`
- On scroll: `backdrop-blur-sm` + border → `iris-dusk/35` (CSS transition, no Framer Motion)

**Logo:** `PROTOGRID` — DM Mono, 13px, `tracking-[0.2em]`, Cold Pearl

**Nav items:** DM Mono, 12px, `tracking-[0.08em]`, Lavender Smoke
- Hover: Cold Pearl, `duration-150`
- Active page: Cold Pearl, no underline or dot

**CTA:** Primary button — "Request a Quote"

**Mobile**
- Hamburger: Lucide `Menu` 20px, replaces with `X` when open
- Dropdown: full-width, same bg, items stacked with `h-12` touch targets
- CTA: full-width at bottom of menu
- Open/close: short `opacity + translateY` animation

---

## Status

- Stack: Next.js + TS + Tailwind + shadcn/ui + Framer Motion — confirmed
- Structure: defined (see Site Structure above)
- Language: Norwegian (primary)
- Hero section: built (`src/components/hero/`)
- Next step: build Navbar
