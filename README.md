# ProtoGrid

Engineering / prototyping / fabrication studio. Turns an idea, task, or raw concept into a real, working product or part.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme inline` design tokens) |
| Fonts | Syne (display), DM Mono (UI/technical) via `@fontsource` |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | Better Auth (email + password, session cookies, role field) |
| ORM | Prisma 7 with `@prisma/adapter-pg` driver |
| Database | PostgreSQL (Render Postgres in production) |
| Forms | React Hook Form + Zod |
| Deploy | Render (Node.js web service) |

---

## Routes

### Public

| Route | Content |
|---|---|
| `/` | Hero + ServicesPreview + ProcessPreview + ProjectsPreview + CTA + Footer |
| `/services` | Full services + capabilities + contact |
| `/process` | Full process steps + FAQ + contact |
| `/projects` | Full case studies + contact |
| `/about` | Studio description + facts + why ProtoGrid + contact |
| `/contact` | Contact form + FAQ |

### Auth

| Route | Description |
|---|---|
| `/login` | Email + password sign-in form |
| `/register` | Account creation form |

### Protected

| Route | Access | Description |
|---|---|---|
| `/account` | Any authenticated user | Profile, submitted requests, sign out |
| `/admin` | Any authenticated user (redirects to dashboard) | — |
| `/admin/dashboard` | Authenticated (role check in component) | Stats overview + recent requests |
| `/admin/requests` | Authenticated (role check in component) | Requests table with status filters |

---

## Auth & database

Better Auth handles registration, login, logout, and session management via HTTP-only cookies. Middleware reads the session cookie (no DB hit) to guard `/account` and `/admin/*`. Server components call `auth.api.getSession()` to verify the session against the database.

Prisma 7 with the `@prisma/adapter-pg` driver connects to PostgreSQL. The schema includes Better Auth's required tables (`user`, `session`, `account`, `verification`) and a domain `Request` model with a `RequestStatus` enum.

Role-based access: the `user` model has a `role` field (`"user"` by default, `"admin"` to grant admin access). Admin pages check the role server-side and redirect non-admins to `/account`.

---

## Homepage structure

`/` is a compact front page — not a full-site scroll. Each preview section links to its dedicated route.

```
Hero                   — headline, subline, two CTAs
ServicesPreview        — 4 service cards (condensed) → /services
ProcessPreview         — 5 step labels → /process
ProjectsPreview        — 2 case study cards → /projects
HomeCtaBanner          — CTA strip → /contact
Footer
```

Full section content lives on dedicated pages (`/services`, `/process`, `/projects`, etc.).

---

## Navbar auth state

| State | Desktop | Mobile menu |
|---|---|---|
| Guest | Register + Sign in | Register, Sign in |
| Authenticated user | Account | Account |
| Admin | Admin + Account | Admin, Account |

---

## What is built

| Area | Status |
|---|---|
| Design system (tokens, fonts, grid background) | Done |
| Navbar (sticky, scroll-aware, mobile menu, auth-aware) | Done |
| Hero section | Done |
| All homepage preview sections | Done |
| All public pages (`/services` `/process` `/projects` `/about` `/contact`) | Done |
| Better Auth setup (server + client + API route) | Done |
| Prisma schema (auth tables + Request model) | Done |
| Middleware (cookie-based route protection) | Done |
| `/login` and `/register` pages | Done |
| `/account` page (server session, DB error handling) | Done |
| `/admin/dashboard` and `/admin/requests` (role-gated) | Done |

## What is placeholder

| Area | Notes |
|---|---|
| Contact form submission | UI complete; needs server action + email service (Resend/Nodemailer) |
| Account "My Requests" | Structure ready; needs DB rows linked to authenticated user |
| Admin stats counters | Hardcoded `—`; needs DB count queries |
| Admin requests table rows | Table structure ready; needs DB query + pagination |
| File upload on contact form | Deferred — needs storage service (Uploadthing or similar) |

---

## Local development

```bash
# 1. Install dependencies (also runs prisma generate via postinstall)
npm install

# 2. Copy env template and fill in values
cp .env.example .env

# 3. Start dev server
# On standard platforms:
npm run dev

# On ARM64 (Termux / Android) — Turbopack not supported:
npm run dev -- --hostname 0.0.0.0 --port 3000 --webpack
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example` for the full list. Required before auth works:

```env
DATABASE_URL="postgresql://user:password@host:5432/protogrid"
BETTER_AUTH_SECRET="<32-byte random string>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secret: `openssl rand -base64 32`

### Database setup

```bash
# Run migrations (requires DATABASE_URL to be set)
npx prisma migrate deploy

# Or push schema directly (dev only)
npx prisma db push
```

---

## Design tokens

Defined in `src/app/globals.css`:

| Token | Hex | Usage |
|---|---|---|
| `ink-shadow` | `#1E2028` | Background |
| `iris-dusk` | `#5C5F7A` | Borders, muted elements |
| `lavender-smoke` | `#8E90A6` | Secondary text, placeholders |
| `cold-pearl` | `#F1F2F4` | Primary text, CTA background |

The body also has a subtle engineering grid background (minor 10px + major 50px lines, `iris-dusk` at low opacity) applied via CSS `background-image`.

---

## Deployment

Deployed on **Render** as a Node.js web service. See `render.yaml`.

```
Build:  npm install && npm run build
Start:  npm start
Node:   22+
```

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` in Render environment variables before deploying.
