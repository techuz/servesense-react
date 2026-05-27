# ServeSense

AI-powered real-time conversation intelligence & performance management platform for restaurants.

> Full project brief — SOW summary, KPI library, module roadmap, build log, design-system notes — lives in [`CLAUDE.md`](./CLAUDE.md).

---

## What's in this repo

The **manager web app** for Phase 1: a Vite + React + TypeScript SPA backed by a TypeScript Express API that currently returns shaped mock data. The Flutter waiter app and the AI engines (speech, RAG, scoring) are separate later engagements.

Status: **M0 → M12 complete on mock data.** Every module renders against deterministic seed data shaped to the final REST contract, so swapping each `useX` hook for a real `fetch` is a one-line change per module when the backend lands.

| Module | What it covers | Route |
|---|---|---|
| M1 — Auth | Animated login (mock auth — any 6+ char password) | `/login` |
| M2 — Restaurant & Outlets | Profile + outlet management | `/restaurant` |
| M3 — Standard Policies | Operating hours, reservations, dining rules, payments | `/orientation/policies` |
| M4 — Menu Knowledge | Items, allergens, taste profile, PDF upload flow | `/orientation/menu` |
| M5 — Service SOP | 10-step flow of service | `/orientation/sop` |
| M6 — Communication & Tone | Aspects + difficult-situation playbook | `/orientation/tone` |
| M7 — Best Practices & Excellence | Advanced (gold-accented tier) | `/orientation/excellence` |
| M8 — Sales Goals & Campaigns | Daily / weekly target tracking | `/orientation/goals` |
| M9 — Staff Management | Create / invite waiters, status & outlet | `/staff` |
| M10 — Knowledge & Coaching | KPI-mapped video lessons & assignment | `/coaching` |
| M11 — Manager Dashboard | ROI hero + revenue & sales analytics | `/dashboard` |
| M12 — Staff Performance | List + drill-down + per-session detail | `/performance` |

---

## Stack

- **Frontend:** Vite + React 18 + TypeScript, React Router 6, `framer-motion`, no third-party UI library — primitives are local in [`client/src/components/primitives/`](./client/src/components/primitives/) and design tokens in [`client/src/styles/tokens.css`](./client/src/styles/tokens.css)
- **Backend:** Node.js + Express + TypeScript, `zod` request validation, JWT auth scaffold
- **Mock layer:** Per-module hooks in [`client/src/lib/mock/`](./client/src/lib/mock/) persist to `localStorage` and return the exact shape the future REST endpoints will return
- **Future:** MySQL 8+ (schema scaffolded in `server/src/db/migrations/`), Deepgram/Whisper for STT, vector DB for RAG knowledge engine
- **Branding:** [Arivex](https://www.arivex.net/)-aligned design system — forest green / warm gold / cream, DM Serif Display headlines on Outfit body

---

## Quick start

**Prerequisites:** Node 18+. No database required during the design phase.

```bash
# Install
cd client && npm install
cd ../server && npm install

# Configure backend (only JWT_SECRET matters for mock auth)
cd ../server
cp .env.example .env
```

Then in two terminals:

```bash
# Terminal 1 — API on :4000
cd server && npm run dev

# Terminal 2 — Web on :5173
cd client && npm run dev
```

- Web: <http://localhost:5173>
- API health: <http://localhost:4000/api/health>

**Login:** any email or phone + any password ≥ 6 characters. The mock endpoint derives a manager profile from the identifier and issues a real JWT — the rest of the app reads the token like it would in production.

---

## Available scripts

**`client/`**

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on :5173, proxies `/api` to the backend |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the built bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

**`server/`**

| Script | What it does |
|---|---|
| `npm run dev` | `tsx watch` on `src/index.ts`, API on :4000 |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run migrate` | Run SQL migrations (when MySQL is wired) |
| `npm run seed:manager` | Seed a manager account (when MySQL is wired) |

---

## Repo layout

```
ServeSense/
├── CLAUDE.md              # Full project brief, module roadmap, build log
├── SOW.pdf                # Original Statement of Work
├── README.md              # This file
├── client/                # Manager web app (Vite + React + TS)
│   ├── index.html
│   └── src/
│       ├── components/    # Primitives + layout + route guards
│       ├── pages/         # One folder per module (M2–M12)
│       ├── routes/        # React Router config
│       ├── styles/        # tokens.css + globals
│       └── lib/           # mock/ hooks, motion presets, api client, auth, toast
└── server/                # API (Express + MySQL-ready)
    └── src/
        ├── config/        # env validation
        ├── db/            # connection + SQL migrations
        ├── middleware/    # auth, error handler
        ├── routes/        # /api/auth, /api/health
        └── scripts/       # migrate, seed-manager
```

---

## When the real backend lands

1. Run `npm run migrate` in `server/` against a MySQL 8+ instance configured via `.env`.
2. Seed the first manager:
   ```bash
   cd server
   npm run seed:manager -- \
     --email=manager@example.com \
     --password=ChangeMe123 \
     --name="Jane Doe" \
     --phone=+919812345678
   ```
3. Swap the body of `POST /api/auth/login` (currently mock — see [`server/src/routes/auth.ts`](./server/src/routes/auth.ts)) for a real bcrypt-compare against the `users` table.
4. Replace each `client/src/lib/mock/<module>.ts` hook with a `fetch` against the equivalent REST endpoint. The shapes already match.

---

## License

Proprietary — © Techuz Infoweb Pvt. Ltd. See SOW for engagement terms.
