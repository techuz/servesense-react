# ServeSense

AI-Powered Real-Time Conversation Intelligence & Performance Management Platform for Restaurants.

> See [`CLAUDE.md`](./CLAUDE.md) for the full SOW summary, KPI library, module roadmap, and architecture decisions.

---

## Stack

- **Frontend** — Vite + React + TypeScript (`client/`)
- **Backend** — Node.js + Express + TypeScript (`server/`)
- **Database** — MySQL 8+
- **Mobile (waiter app, later)** — Flutter
- **Branding** — Arivex-aligned design system (forest green / warm gold / cream)

## Repo Layout

```
ServeSense/
├── CLAUDE.md              # Project brief, SOW summary, module roadmap
├── SOW.pdf                # Original Statement of Work
├── README.md              # This file
├── client/                # Manager web app (Vite + React)
│   ├── src/
│   │   ├── components/    # Primitives + layout
│   │   ├── pages/         # Route pages
│   │   ├── routes/        # React Router config
│   │   ├── styles/        # Design tokens + globals
│   │   └── lib/           # api client
│   └── package.json
└── server/                # API (Express + MySQL)
    ├── src/
    │   ├── config/        # env validation
    │   ├── db/            # connection + migrations
    │   ├── middleware/    # auth, errors
    │   ├── routes/        # API routes
    │   └── scripts/       # migrate, seed
    └── package.json
```

## Local Setup

**Prerequisites:** Node 18+, MySQL 8+ (local via Docker/Brew or remote).

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
# Edit .env — set DB credentials and a strong JWT_SECRET.
```

### 3. Run database migrations

```bash
cd server
npm run migrate
```

### 4. Seed a manager account (SOW §2.1 — no public signup)

```bash
cd server
npm run seed:manager -- \
  --email=manager@example.com \
  --password=ChangeMe123 \
  --name="Jane Doe" \
  --phone=+919812345678
```

### 5. Start everything

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

- Web app: <http://localhost:5173>
- API:      <http://localhost:4000/api/health>

## Module Roadmap

See [`CLAUDE.md` §12](./CLAUDE.md). Phase 1 (this engagement) is the manager web app, modules M0–M12. The Flutter waiter app and AI engines are separate engagements.
