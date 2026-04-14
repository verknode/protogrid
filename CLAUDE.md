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

## Status

- Stack: not yet decided
- Structure: not yet created
- Next step: map out site structure by sections, then decide stack
