# ServeSense

> AI-Powered Real-Time Conversation Intelligence & Performance Management Platform for Restaurants.
> Source: `SOW.pdf` (Business Requirements Specifications v1.1, dated 12/01/2026, © Techuz Infoweb Pvt. Ltd.).

---

## 1. Project Overview

ServeSense is an AI-driven platform that assists restaurant waiters during live customer interactions and provides post-session performance analytics to restaurant management.

**Objectives**
- Provide real-time, AI-powered suggestions to waiters during live customer conversations.
- Ensure SOP compliance, accurate menu knowledge, and appropriate tone.
- Analyze conversation quality, sentiment, and performance.
- Generate post-session summaries, KPI-based scoring, and coaching recommendations.
- Enable restaurant managers to track performance, drive upsells, and improve service quality.

**Deliverables**
1. **Flutter mobile application** — for waiters (frontline use, live session assistance).
2. **Web-based admin / manager dashboard** — for restaurant managers.
3. **AI backend** — LLMs + speech processing (Deepgram / Whisper) + RAG vector knowledge store.

---

## 2. Actors & User Roles

| # | Role | Surface | Purpose |
|---|---|---|---|
| I | Waiter / Receptionist (Frontline) | Flutter mobile app | Receives live AI coaching during a guest session. |
| II | Restaurant Manager (Admin) | Web dashboard | Operational & performance owner; configures the system, reviews KPIs, manages staff. |
| III | Orientation | (Manager-fed data) | The data layer the manager must populate so the AI has a single source of truth. |
| IV | System Output | (AI & Analytics layer) | The platform's automated processing, scoring, and recommendation engines. |

---

## 3. Epic 1 — Waiter (Flutter Mobile App)

### Story 1.1 — Login & Access
*As a waiter, I want to log in using assigned credentials so I can access my shift-specific dashboard, and only see data for my outlet/shift.*

**Fields**: Username / Employee ID (text, unique, case-insensitive), Password / PIN (masked, min length), Device ID (auto-captured).
**System**: Secure auth, RBAC, login/logout timestamps.

### Story 1.2 — Session Dashboard (Pre-Interaction)
*Start a session when approaching a table; pause/resume; end when the guest leaves.*

**Fields**: Guest Name (optional, max length), Table # (unique for active sessions), Service Mode (Lunch / Dinner), Session Start (button), Pause (button), End (button), Session Status (Started / Paused / Ended).
**System**: Prevents multiple active sessions per table; tracks lifecycle; associates session with waiter, outlet, table.

### Story 1.3 — Live Session Experience
During an active session, the system listens continuously and provides real-time AI assistance.

**A. Live AI Suggestions** — Data captured automatically (no manual input):
- Audio stream (real-time), Speech-to-Text transcript, Tone indicators, Confidence score, Empathy score, Menu query context, Upsell attempts.

**B. Tone & Behaviour Guidance** (real-time, system-generated):
| Indicator | Display | Behaviour |
|---|---|---|
| Politeness Level | Colour bar / icon | Green / Amber / Red |
| Empathy Level | Score / icon | Real-time change |
| Confidence Level | Meter | Based on voice tone |
| Difficult Situation Alert | Alert banner | Appears when guest dissatisfaction detected |

Example prompts: *"Try a softer tone"*, *"Acknowledge guest concern"*, *"Pause and reassure the guest"*.

**C. Menu Recommendations Panel**:
Recommended Item (card list), Reason (preference/allergy/ingredient), Taste Profile (spicy/mild/sweet), Allergy Warning (alert tag), Portion Size (light vs filling), Ingredient Insight (tooltip), Priority Tag (special / high-margin).
*Logic*: guest preferences from conversation + allergy keywords + ingredient rules + manager-defined priorities.
*System*: continuous listen (opt-in visibility), STT in real time, analyzes tone/confidence/flow/SOP compliance, generates non-intrusive "ghost coach" prompts (tone softening, empathy nudges, upsell suggestions, allergy warnings), biases by manager-defined menu priorities, logs upsell attempt vs outcome.

**D. Guest Feedback Capture** — Star Rating 1–5 prompted before session end; stored against session; feeds performance scoring.

### Story 1.4 — Waiter Main Dashboard (Post-Session)

**A. Performance Metrics** (with formulas):
| Metric | Formula |
|---|---|
| Upsell Attempts | Count of upsell prompts shown |
| Successful Upsells | Count of upsell items added to orders |
| Upsell Success Rate | (Successful Upsells / Upsell Attempts) × 100 |
| Missed Opportunities | Eligible Upsell Scenarios − Upsell Attempts |
| Confidence Score | Avg AI confidence score per interaction |
| Menu Knowledge | (Correct Menu Responses / Total Menu Interactions) × 100 |
| Tone Score | Avg tone-quality score per interaction |
| Empathy Score | Avg AI empathy rating per interaction |

Aggregated daily/weekly; weak areas highlighted visually.

**B. Conversation History**:
List view: Session Date & Time, Table #, Guest Name, Service Mode, Star Rating.
Session detail metrics: Food Safety Awareness Score, Identified Upsell Opportunities, Empathy Score, Tone Consistency, Menu Knowledge Accuracy.
*System*: stores session summaries (not full audio unless configured), allows read-only transcript view (optional), masks sensitive guest data.

**C. Leaderboard / Peer Comparison**:
Rank, Waiter Name / Alias (privacy-controlled), Items Sold, Progress %, Badge Earned.
Sorts dynamically; tie-breakers via timestamp or secondary metrics.

**D. Learning & Coaching**:
Lesson fields: ID, Title, Category (Tone / Empathy / Menu / Upsell), YouTube Link, Description, Related Metric, Assigned Outlet/Role.
Auto-mapping: low empathy → empathy lesson; low tone consistency → tone lesson; low menu accuracy → menu video; missed upsells → upselling video.
"My Learning" view: Title, Category tag, YouTube link, Completion %, Assigned Reason, Completion Date.
*System*: tracks video access, marks lesson completed (manual or % watched — configurable), improves AI coaching suggestions after completion.

### Waiter User Journey
1. Log in to mobile app with assigned credentials.
2. Start a live session when approaching a guest.
3. App listens to live conversation.
4. Real-time transcript generated (optional visibility).
5. AI provides live suggestions: menu questions, allergies, recommendations, tone/empathy cues.
6. Waiter adapts responses using AI guidance.
7. Session ends manually.
8. Post-session summary generated.
9. Waiter reviews performance, feedback, badges.
10. Waiter guided to micro-lessons if improvement needed.

### Waiter Key Features
Login/Logout · Start & stop live session · Live transcript (read-only) · Real-time AI "ghost coach" suggestions · Tone & empathy alerts · SOP-compliant response guidance · Post-session summary · KPI scores (tone, empathy, menu knowledge, upsells) · Missed upsell indicators · Badges & leaderboard · Micro-lesson recommendations.

---

## 4. Epic 2 — Restaurant Manager (Web Dashboard)

### 2.1 Signup & Login
Super-admin creates manager accounts. Login fields: Email / Phone, Password.
*System*: validates email/phone uniqueness, RBAC (Manager/Admin), secure session, login activity logs.

### 2.2 Staff Management
Create waiter accounts: Staff Name, Email, WhatsApp Number, Role (Waiter), Status (Active/Inactive).
*System*: sends invite via Email/SMS/WhatsApp with app link & credentials; links staff to restaurant & outlet; prevents deactivated staff from logging in; tracks training completion & performance.

### 2.3 Restaurant Orientation & Data Setup
*Detailed in Epic 3 (Orientation).* Manager feeds and maintains all operational data required for AI training and guidance.

### 2.4 Manager Dashboard (Business & Performance View)
**Default date range: Last 30 Days.**

**A. ROI & Business Impact** (read-only metrics):
- Additional Revenue (revenue generated via AI)
- Before vs After (upsell rate, avg check size)
- CoreVista before/after metrics: Upsell Success Rate, Average Order Size, Customer Stratification, Service Errors, Staff Confidence Score
*System*: calculates ROI automatically; compares historical vs current; updates periodically.

**B. Revenue & Sales Analytics**:
- Category Analysis: Revenue by Category (wine, pasta, desserts) — bar/stacked charts
- Item Analysis: item-wise sales — visual bar charts
- Errors: Service Errors — missed SOPs, mistakes
*System*: aggregates item-level sales into categories; category-wise comparison across time periods.

### 2.5 Staff Performance List & Drill-Down View
Per-staff aggregated metrics: Upsell Attempts, Successful Upsells, Missed Opportunities, Confidence, Menu Knowledge, Tone.
Formulas as defined in §3.1.4 (same KPI library).

**Conversation-Level View**: Table #, Guest Name, Service Mode, Session Date. Filter/search; opens session detail.

**Session Detail Metrics**: Food Safety Awareness, Upsell Opportunities, Empathy Score, Tone Consistency, Menu Knowledge Accuracy, Guest Rating — with formulas (rule-based + AI scoring; stores results for reporting/coaching).

### 2.6 Knowledge & Coaching Management
Inputs: Lesson Title, Lesson Type, YouTube Link, Mapped Skill, Assigned Staff (multi-select), Completion % (auto).
*System*: stores in knowledge base; maps lessons to skills/KPIs; tracks completion automatically; feeds lessons into AI recommendation engine.

### Manager User Journey
1. Log in to web admin dashboard.
2. Set up restaurant profile and operational data.
3. Upload menu, ingredients, SOPs, policies.
4. Define KPIs, grading scales, service benchmarks.
5. Create and manage waiter/receptionist accounts.
6. Monitor live and historical performance data.
7. Review post-session summaries and analytics.
8. Identify training gaps and coaching needs.
9. Configure sales goals and gamification rules.
10. Review ROI, revenue impact, and engagement metrics.

### Manager Key Features
Login/Logout · User creation & role management · Menu upload (PDF → structured text) · Ingredient & allergy management · SOP and policy configuration · KPI creation and weighting · Grading scale definition (% / score / units) · Dashboard of all users and sessions · Performance analytics (time, upsells, missed opportunities) · Staff confidence and coaching metrics · Micro-lesson content management.

---

## 5. Epic 3 — Orientation Modules (Manager-Fed Data)

### Module 3.1 — Restaurant Standard Policies (MANDATORY)
Fields: Operating Timings (open/close/last order), Waiting Policy, Reservation Policy, Table Holding, Dining Rules (dine-in vs takeaway, outside food), Guest Accommodation (child seating, elderly, wheelchair), Payments (cash, card, UPI, split bills).
*System*: used during live guest conversations; prevents contradictory responses; flags policy violations; displays prompts when policy questions arise.

### Module 3.2 — Menu Knowledge (MANDATORY)
Fields: Dish Type (Veg/Non-veg), Taste Profile (spicy/mild/sweet), Ingredients (all), Portion Size (light vs filling), Popular Items (best sellers, specials).
*System*: powers allergy detection, real-time menu recommendations, flags incorrect menu knowledge during sessions, scores waiter accuracy for training insights.

### Module 3.3 — Service SOP — Flow of Service (MANDATORY)
| Step | Description | Outcome |
|---|---|---|
| Greeting | Warm welcome | First impression |
| Seating | Preference-based | Comfort |
| Menu Handover | Clear & calm | Clarity |
| Order Taking | Listen & repeat | Error reduction |
| Order Confirmation | Verify preferences | Trust |
| Serving | Timely & accurate | Satisfaction |
| Table Check | Once post-serving | Care without hovering |
| Clearing | Polite | Closure |
| Billing | Transparent | Smooth end |
| Farewell | Thank & invite back | Brand recall |

*System*: tracks SOP compliance, flags missed/skipped steps, uses SOP adherence in scoring, suggests corrections in real time.

### Module 3.4 — Communication & Tone (MANDATORY)
| Aspect | Trained Behaviour | Purpose |
|---|---|---|
| Tone | Calm, respectful | De-escalation |
| Language | Polite phrasing | Professionalism |
| Listening | No interruption | Guest feels heard |

*System*: analyzes voice tone & speech patterns; triggers alerts for rude/dismissive behaviour; scores tone consistency per session.

### Module 3.5 — Best Practices & Excellence (ADVANCED)
| Area | Focus |
|---|---|
| Anticipation | Water, napkins, cutlery |
| Peak Hours | Speed + clarity |
| VIPs | Personal touch |
| Recovery | Calm mistake handling |

*System*: applies advanced coaching to experienced staff; rewards proactive service with higher scores; identifies staff ready for leadership roles.

### Module 3.6 — Sales Goals & Campaigns
Fields: Goal Name (text), Goal Type (Daily/Weekly), Target Items (multi-select), Target Value (number), Validity Period (date range).

---

## 6. Epic 4 — System Output (AI & Platform Logic)

### 4.1 Conversation Processing Engine
**Inputs**: Live audio stream (waiter mobile app), session metadata (table, waiter, time).
**Features**: audio ingestion, speaker diarization, speech-to-text (Deepgram), real-time processing pipeline.
**Behaviour**: captures only during active sessions; identifies waiter vs guest via speaker diarization; converts speech to text in near-real-time (Deepgram / Whisper); streams structured text downstream; stops processing on pause/end.

### 4.2 Intent, Emotion & Tone Engine
**Inputs**: transcribed conversation, speaker labels, orientation rules (tone, SOPs).
**Detects intent**: allergy inquiry, pricing question, recommendation request, complaint, upsell opportunity.
**Classifies sentiment**: Positive, Neutral, Frustrated/Negative.
**Evaluates waiter tone**: Polite, Empathetic, Confident, Rushed/Defensive.
**Tracks conversation temperature**: Calm, Neutral, Sensitive, Escalating.
**Behaviour**: sends real-time alerts to waiter app when risk is detected.

### 4.3 RAG Knowledge Engine
**Inputs**: manager-uploaded data, detected intent, conversation context.
**Features**: vector embedding generation, real-time data retrieval, zero-retraining architecture, dynamic updates from manager uploads.
**Behaviour**: converts all manager-fed data (menu, SOPs, policies) into embeddings stored in a vector DB; fetches only relevant data based on live intent; no model retraining needed; real-time updates when manager changes data; acts as the **single knowledge source** for AI responses.

### 4.4 SOP & KPI Evaluation Engine
**Inputs**: session transcript, SOP definitions, KPI configurations.
**Features**: rule-based checks, LLM-based reasoning, KPI scoring per session, highlight extraction, feedback generation.
**Behaviour**: evaluates conversations against Greeting SOPs, Menu accuracy rules, Allergy handling rules, Tone & professionalism standards; calculates KPI scores per session; identifies missed SOP steps, incorrect responses, missed upsell opportunities; generates structured feedback for waiter and manager dashboards.

### 4.5 Recommendation & Learning Engine
**Inputs**: KPI scores, coaching triggers, learning content (YouTube links), gamification rules.
**Features**: micro-lesson recommendation, coaching trigger detection, continuous improvement loop, gamification logic.
**Behaviour**: maps weak KPIs to relevant micro-lessons; auto-assigns lessons to staff; adjusts future coaching prompts based on lesson completion; improves AI guidance over time using performance trends.

### 4.6 Order Confirmation Prompts
Post-order, system displays **Confirm Order View** on waiter app prompting: repeat order, confirm preferences, verify allergies. Flags skipped confirmation as SOP deviation. Reduces order errors and disputes.

**Post-Session System Outputs (umbrella)**: session summary generation, KPI-wise scoring, missed opportunity analysis, coaching & learning recommendations, data aggregation for manager dashboards & ROI analytics.

---

## 7. Cross-Cutting KPI Library

| Metric | Formula | Notes |
|---|---|---|
| Upsell Attempts | Count of upsell prompts shown | AI- or staff-driven, regardless of acceptance |
| Successful Upsells | Count of upsell items added to orders | Only when item is added & confirmed |
| Upsell Success Rate | (Successful / Attempts) × 100 | |
| Missed Opportunities | Eligible Upsell Scenarios − Upsell Attempts | Eligible scenarios identified by AI from order context + menu rules |
| Confidence Score | Avg AI confidence per interaction | Based on speech clarity, hesitation, timing, assertiveness |
| Menu Knowledge | (Correct Menu Responses / Total Menu Interactions) × 100 | Validated against menu DB |
| Tone Score | Avg tone-quality score per interaction | Sentiment + politeness + non-pushy upsell |
| Empathy Score | Avg AI empathy rating per interaction | Acknowledgment, reassurance, patience, emotional alignment |
| Food Safety Awareness | (Safety-Compliant / Total Safety-Related Interactions) × 100 | Allergy disclosure, cross-contamination warnings, safety confirmations |
| Tone Consistency | (Interactions with Consistent Tone / Total) × 100 | Detects abrupt or negative shifts |
| Menu Knowledge Accuracy | (Correct Menu Info / Total Menu Info Instances) × 100 | Items, ingredients, pricing, availability |
| Guest Rating | Avg of customer ratings received (1–5) | App / SMS / QR / POS feedback |

---

## 8. Out of Scope (Phase 2 — Deferred)

The following items are struck through in the SOW and are **not part of this engagement**:
- **2.5 AI Coaching & Learning Insights** consolidated view — Coaching Effectiveness metrics, Learning Progress & Adoption, AI-Recommended Actions.
- **2.6 Overall Impact Summary** — Total Coaching Sessions, Estimated Turnover Savings, Staff Satisfaction Indicators.

---

## 9. Technology Stack

### Web — Manager / Admin Dashboard (this engagement)
- **Frontend**: Vite + React 18 + TypeScript
- **Routing**: React Router 6 (data router via `createBrowserRouter`)
- **Animation**: `framer-motion` (variants, layout, AnimatePresence, portal popovers)
- **Utility**: `clsx` (via `@/lib/cn` wrapper)
- **Backend**: Node.js + Express + TypeScript (currently shimmed: real shape, mock data)
- **Database**: MySQL (schema scaffolded; backend integration deferred — see "Build phase" below)
- **Auth scaffolding**: JWT (bearer token), bcrypt, zod request validation
- **API style**: REST (JSON), Vite proxy `/api → http://localhost:4000`

### Build phase — design-first, mock data
Current focus is **design-grade UI with mocked data** so the stack stays consistent
when the real backend lands. All mock data hooks (`useRestaurantProfile`, `usePolicies`,
`useMenuItems`, …) persist to **localStorage** and follow the exact shape the future
REST endpoints will return — swap is a one-line change per hook.

### Mobile — Waiter App (later engagement)
- **Flutter** + Dart. Out of scope for now.

### AI Backend (later / separate service)
- Speech-to-text: Deepgram / Whisper
- LLM provider: TBD
- Vector DB: TBD (for RAG knowledge engine)
- Real-time transport: WebSocket / WebRTC for audio
Out of scope for this engagement; the manager web app will integrate with it later.

---

## 10. Branding & Design System

Branding strictly follows **[Arivex](https://www.arivex.net/)**. Vibe: upscale hospitality — forest + gold + cream, editorial serif headings on clean sans body. Premium, organic, refined.

### Color Tokens (Arivex-extracted)
| Token | Hex | Use |
|---|---|---|
| `--ss-green-900` | `#0f1a12` | Primary text, dark surfaces |
| `--ss-green-700` | `#3a6b4c` | Primary brand |
| `--ss-green-500` | `#5a9a6e` | Supporting brand, links |
| `--ss-green-600` | `#127760` | Hover / pressed state |
| `--ss-gold-500` | `#c9953c` | Accent, primary CTA |
| `--ss-gold-300` | `#e8c77b` | Secondary accent, badges |
| `--ss-cream-50` | `#f6f2ec` | Page background |
| `--ss-cream-0` | `#ffffff` | Card / surface |
| `--ss-warm-gray-500` | `#8a8279` | Muted text, borders |

(Status colors — success / warning / error — to be derived from this palette during M0.)

### Typography
- **Headings (display, h1, h2)**: `DM Serif Display` — **only used above ~1.5rem**. At smaller sizes the serif's high-contrast strokes feel cluttered in card grids; we switched all card/sub-headings to sans-semibold during M2 polish.
- **Sub-headings (h3+) / UI / body**: `Outfit`
- **Muted/description copy**: Outfit weight **300** (`--fw-muted`) with `--lh-relaxed` (1.7) — matches the Arivex pattern; reduces optical weight on descriptive copy.
- **Fluid heading scales** in tokens: `--fs-hero`, `--fs-page-title`, `--fs-section`, `--fs-card-title` — every page H1/H2 derives from these so we change once and the platform follows.

### Tier visual coding
| Tier | Accent | Used for |
|---|---|---|
| **Mandatory** (M3–M6) | green-led | Standard Policies, Menu, SOP, Communication |
| **Advanced** (M7) | gold-led | Best Practices & Excellence (icons, eyebrow, hover border, footer note) |
| **Status / brand moments** | gold | Signature, popular, mandatory badge dots, eyebrow accents |

### App-shell scroll pattern
The viewport itself never scrolls — `body { overflow: hidden }`. Each pane (`.ss-shell__content`, sidebar, drawer body, policy nav, etc.) manages its own overflow. Topbar + sidebar stay fixed; the content pane is the only scroll surface during normal use. `scroll-behavior: smooth` enabled.

### Sleek scrollbar
Applied globally via `*::-webkit-scrollbar` and Firefox `scrollbar-*` props — 10px width, transparent track, warm-gray-300 pill thumb with 2px inset, darkens to warm-gray-500 on hover. Dark surfaces (sidebar, login brand panel) get an inverted translucent-white variant.

### Atmosphere & texture (system-wide)
Depth is tokenized (`tokens.css` → "Atmosphere & texture") and applied app-wide at single-digit opacity — the upscale-hospitality "warm light on linen" feel, never noticeable decoration. The login brand panel pioneered the language; it now lives in tokens so every surface shares it.
- `--tex-grain` (inline SVG fractal noise) + `--tex-grain-opacity` (dark) / `--tex-grain-opacity-soft` (light)
- `--atmosphere-page` — warm gradient wash on the content pane (over `--color-bg`); grain rides behind content at z-index 0 so text stays crisp
- `--atmosphere-dark` / `--glow-green` / `--dot-grid-dark` — dark-surface recipe (sidebar + login). **No gold glow on the sidebar** (it tinted the brand lockup)
- `--sheen-card` — top-edge inner highlight composed into every card's `box-shadow` so surfaces read as lifted, not flat white

### Component Approach
Code-first design system. All primitives live in `client/src/components/primitives/`, all design tokens in `client/src/styles/tokens.css`. No third-party UI library — we ship our own. See §13 for the full primitive inventory.

---

## 11. Architecture Decisions

| Decision | Choice |
|---|---|
| **Tenancy model** | One manager → one restaurant → many outlets. Outlet is a scoping filter across staff, KPIs, sessions. |
| **Manager creation** | Seed via DB script / CLI (no super-admin UI in this phase). Manager logs in with email + password. |
| **Frontend ↔ Backend split** | Separate Vite SPA and Express API (not Next.js full-stack). Connected via REST. |
| **Workflow** | Code-first with Arivex tokens. No Figma mockups upfront; iterate in browser. |
| **Module sequence** | Foundation → Auth → Restaurant/Outlet setup → Orientation (policies, menu, SOP, tone, best practices, sales goals) → Staff → Coaching → Dashboard → Staff drill-down. |

---

## 12. Module Roadmap — Manager Web (strict SOW mapping)

| # | Module | SOW ref | Status | Route |
|---|---|---|---|---|
| **M0** | Foundation: design tokens, layout shell, primitives, routing, DB schema, auth scaffold | — | ✅ Complete | — |
| **M1** | Auth — Animated login (mock auth, awwwards-level) | §2.1 | ✅ Complete | `/login` |
| **M2** | Restaurant Profile & Outlets setup | §2.3 | ✅ Complete | `/restaurant` |
| **M3** | Orientation › Standard Policies (MANDATORY, PDF-fed) | §3.1 | ✅ Complete | `/orientation/policies` |
| **M4** | Orientation › Menu Knowledge (MANDATORY, PDF-fed) | §3.2 | ✅ Complete | `/orientation/menu` |
| **M5** | Orientation › Service SOP — 10-step flow (MANDATORY, PDF-fed) | §3.3 | ✅ Complete | `/orientation/sop` |
| **M6** | Orientation › Communication & Tone (MANDATORY, PDF-fed) | §3.4 | ✅ Complete | `/orientation/tone` |
| **M7** | Orientation › Best Practices & Excellence (ADVANCED, PDF-fed) | §3.5 | ✅ Complete | `/orientation/excellence` |
| **M8** | Orientation › Sales Goals & Campaigns (PDF-fed) | §3.6 | ✅ Complete | `/orientation/goals` |
| **M9** | Staff Management (create waiter, invite, active/inactive) | §2.2 | ✅ Complete | `/staff` |
| **M10** | Knowledge & Coaching Management | §2.6 | ✅ Complete | `/coaching` |
| **M11** | Manager Dashboard (ROI + Revenue & Sales Analytics) | §2.4 | ✅ Complete | `/dashboard` |
| **M12** | Staff Performance List & Drill-Down | §2.5 | ✅ Complete | `/performance` + `/performance/:staffId` |

All Phase-1 modules are now wired against mock data. M11 and M12 consume metrics the AI engines (Epic 4) will eventually produce — views render today against seeded data shaped to the final API contract, so swapping each hook for a real `fetch` is a one-line change per page.

**Orientation modules (M3–M8) are PDF-fed.** Per the SOW (§3 — "Manager feeds and maintains all operational data"), each orientation module page shows a `OrientationSourceBanner` with the active PDF's filename + upload timestamp + page count, plus a "Replace PDF" action that opens an upload drawer. When no PDF has been uploaded for a module, the page renders a full-bleed drop-zone empty state. No editable fields anywhere across M3–M8 — content is strictly read-only display of what was extracted from the uploaded document. In mock-data mode the seed data is always shown as "extracted from" a plausibly-named seed PDF.

---

## 13. Primitives Library

All primitives live in `client/src/components/primitives/`. They use design tokens, ship their own CSS file co-located with the component, and were built for reuse across the platform.

| Component | File | Used in |
|---|---|---|
| **Button** | `Button.tsx` | Everywhere — 5 variants (primary, secondary, ghost, danger, link) × 3 sizes; framer-motion `whileHover` lift + `whileTap` press; loading spinner state |
| **Input** | `Input.tsx` | Forms — label / hint / error states; 4px focus ring; brand-green label shift on focus; Chrome autofill override (inset shadow trick) |
| **Textarea** | `Textarea.tsx` | M2 — same focus system as Input. (Orientation modules M3–M8 are read-only and no longer use this primitive.) |
| **Select** | `Select.tsx` | M2, M9 — native select with custom chevron + matching focus ring |
| **Checkbox** | `Checkbox.tsx` | (Reserved for primitives library; orientation modules are now read-only) |
| **Switch** | `Switch.tsx` | M2, M9 — spring-glided thumb (layout animation), label + description, sm/md sizes |
| **Card** | `Card.tsx` + `Header/Title/Description/Body/Footer` | M2, M3, etc. — sans semibold title (post-M2 typography polish) |
| **Badge** | `Badge.tsx` | Status indicators — 7 tones (neutral, brand, gold, success, warning, danger, info) × subtle / solid |
| **Drawer** | `Drawer.tsx` | M2 outlet form, M9 staff form, M10 lesson form, plus the shared `OrientationReplaceDrawer` — right-side spring slide, overlay blur, ESC + click-outside, body scroll lock |
| **Modal** | `Modal.tsx` | M9 invite-success confirmation (`InviteSuccessModal`) — centered dialog mirroring Drawer's portal + overlay + ESC + scroll-lock conventions, but scales in from center; sm/md/lg sizes, optional `forceful` (hides close + disables click-outside for required steps) |
| **EmptyState** | `EmptyState.tsx` | M2 outlets, M4 menu filters, M6 situations, M8 goals — dashed card with gradient icon tile + CTA slot |
| **TimePicker** | `TimePicker.tsx` | (Reserved for primitives library; M3 operating timings now read-only) — **portal-rendered** popover (escapes ancestor `overflow: hidden`); flips above when no room below; preset quick-times grid + stepper editor + AM/PM sliding toggle |
| **PhraseList** | `PhraseList.tsx` | M5, M6, M7 — list of phrases with three visual tones: do (green) / avoid (red) / quote (gold). Gained a `readOnly` prop in the orientation refactor — same chips, no input row, no remove buttons. |
| **DateFilterControl** | `DateFilterControl.tsx` | M12 — Notion-style preset list (Today / Yesterday / Last 7 days / Last 30 days / This month / Last month / This year / Last year / All time) + an inline-expanding **Custom range** with two date inputs. Portal-rendered popover, flips above the trigger when there's no room below. Solid white background (`--ss-cream-0`, not the translucent `--color-card`). |

### Orientation primitives (PDF-fed pattern)
| Component | File | Purpose |
|---|---|---|
| **OrientationSourceBanner** | `components/orientation/OrientationSourceBanner.tsx` | The thin pill at the top of every orientation module page: PDF icon + filename + "Uploaded N ago · N pages parsed" + "Replace PDF" CTA. |
| **OrientationUpload** | `components/orientation/OrientationUpload.tsx` | Drop-zone card with simulated extraction animation (spinning ring + animated SVG document strokes + staggered "scanning… detecting… structuring…" steps). Used inline as the empty state and inside the replace drawer. |
| **OrientationReplaceDrawer** | `components/orientation/OrientationReplaceDrawer.tsx` | Drawer wrapper around OrientationUpload — opens from the banner's Replace CTA. |
| **Policies Display.tsx** | `pages/Policies/Display.tsx` | Read-only display primitives — `Fact` / `FactGrid` (label-above-value), `BoolPill` (green check / muted X), `BoolGrid`, `RulesBlock` (gold-left-rule editorial blockquote). Module-local but reusable pattern. |

### Visual / motion primitives
| Helper | File | Purpose |
|---|---|---|
| **PageTransition** | `components/PageTransition.tsx` | Standard route-level fade+lift |
| **ProtectedRoute / PublicOnlyRoute** | `components/ProtectedRoute.tsx` | Auth route guards |
| **Motion presets** | `lib/motion.ts` | Shared variants (`fadeUp`, `scaleIn`, `stagger`, `pageTransition`), easings, durations, hover presets |
| **AuthContext** | `lib/auth.tsx` | Login / logout / token storage with cross-tab sync |
| **ToastContext** | `lib/toast.tsx` | Bottom-right toast region with spring entry, auto-dismiss, success/error/info tones |
| **API client** | `lib/api.ts` | Bearer-token-aware fetch wrapper |
| **`cn()`** | `lib/cn.ts` | clsx wrapper for clean conditional classnames |

---

## 14. Mock Data Hooks

Each module owns a hook in `client/src/lib/mock/`. All persist to localStorage,
deep-merge stored data with seed (so adding fields later never blanks user state),
and follow the exact shape the future REST endpoints will return.

| Hook | File | Storage key | Returns |
|---|---|---|---|
| `useRestaurantProfile()` | `mock/restaurant.ts` | `ss_mock_restaurant_profile` | `{ profile, updateProfile, resetProfile }` |
| `useOutlets()` | `mock/restaurant.ts` | `ss_mock_outlets` | `{ outlets, upsertOutlet, removeOutlet, toggleOutletStatus }` |
| `usePolicies()` | `mock/policies.ts` | `ss_mock_policies` | `{ policies, update }` for the 7 policy sections |
| `useMenuCategories()` | `mock/menu.ts` | `ss_mock_menu_categories` | `{ categories, addCategory, renameCategory, removeCategory }` |
| `useMenuItems()` | `mock/menu.ts` | `ss_mock_menu_items` | `{ items, upsert, remove, toggle, bulkImport }` |
| `useSop()` | `mock/sop.ts` | `ss_mock_sop_v3` | `{ source, stages, setFromUpload, clearSource, upsertStage, removeStage, moveStage, addRule, upsertRule, removeRule, stats }` — document-fed **stages → rules** model (Day 9). `source` = uploaded-doc metadata; each `SopStage` (Name / Expected Outcome / Scoring Weight) holds `SopRule[]` (priority `must`/`should` + instruction + optional script). `simulateSopExtraction()` fakes the LLM parse. |
| `useTables()` | `mock/tables.ts` | `ss_mock_tables_v1` | `{ tables, upsert, remove, toggleStatus, isDuplicateNumber, stats }` — restaurant floor plan (number / seats / section / status). **Not in SOW v2** — added Day 9 per dev request so the waiter app can pick a table instead of free-typing. 10 seeded tables across Main Dining / Patio / Bar / Private Room. |
| `useCommunication()` | `mock/communication.ts` | `ss_mock_communication` | `{ data, updateAspect, upsertSituation, removeSituation }` |
| `useExcellence()` | `mock/excellence.ts` | `ss_mock_excellence` | `{ data, updatePrinciple, updateArea }` |
| `useSalesGoals()` | `mock/goals.ts` | `ss_mock_sales_goals` | `{ goals, upsert, remove, toggleEnabled, stats }` |
| `useStaff()` | `mock/staff.ts` | `ss_mock_staff` | `{ staff, upsert, remove, toggleStatus, resendInvite, stats }` |
| `useLessons()` | `mock/coaching.ts` | `ss_mock_lessons` | `{ lessons, upsert, remove, toggleActive, stats }` |
| `useDashboardMetrics(period)` | `mock/dashboard.ts` | (computed) | Period-scoped ROI / KPIs / category revenue / top items / service errors |
| `useAllStaffPerformance()` / `useStaffSessions(id)` / `useSession(id)` | `mock/performance.ts` | `ss_mock_performance` | Aggregated KPIs + per-session data with deterministic baselines per staff |
| `useNotifications()` | `mock/notifications.ts` | `ss_mock_notifications_v1` | `{ notifications, unreadCount, markRead, markAllRead, remove, clearAll }` — manager in-app feed for the 7 Dashboard-targeted events in the §7 matrix; sorted newest-first, seeded mixed read/unread with deep-links into the relevant module. |
| `useOrientationSource(moduleKey)` | `mock/orientationSource.ts` | `ss_mock_orientation_source_<module>` | `{ source, uploadSource, clearSource, meta }` — per-module PDF metadata for M3–M8. Six independent storage keys so each module's source PDF is tracked separately. Seeded with plausible filenames (`lumiere_standard_policies_2026.pdf`, `lumiere_menu_q2_2026.pdf`, etc.) so the default state already renders as parsed content. |

Seed data is realistic (Lumière Bistro brand, two outlets, full menu, full SOP scripts, six difficult-situation playbook scenarios, 8 sales campaigns, 10 staff across both outlets with mixed roles + invite states, 7 KPI-mapped video lessons with per-staff assignment + completion %, and ~60 generated sessions with profile-tied KPI baselines) so every page reads as a populated working state out of the box.

---

## 15. Build Log

### Day 11 — Menu allergens: checkbox grid → free-form tag input (2026-06-16)

Small UX-alignment pass on **Menu Knowledge (M4)** per dev request: make the allergens field behave like the ingredients field.

- **`mock/menu.ts`** — `MenuItem.allergens` retyped `Allergen[]` → **`string[]`** (free-form, manager-typed, mirroring `ingredients`). The `Allergen` union + `allergenOrder` + `allergenLabels` are kept as the canonical thirteen. New **`formatAllergen(a: string)`** helper renders a known canonical label when one exists, else title-cases the typed value — so seeded lowercase values (`shellfish`) still read as "Shellfish".
- **`MenuItemForm.tsx`** — replaced the 13-checkbox `ss-allergens__grid` with a tag-input identical in mechanics to ingredients (`allergenInput` state + `addAllergen`/`onAllergenKey`: Enter/comma to add, Backspace-on-empty to pop, blur to commit, × to remove). Removed `toggleAllergen` and the `allergenLabels`/`allergenOrder`/`Allergen` imports. **Food-safety gate preserved**: save still blocked until ≥1 allergen tagged or "no allergens" explicitly confirmed; adding a chip auto-clears a prior `allergensConfirmed`. Kept the `.ss-allergens` wrapper (error border, head, required note, none-checkbox, error message).
- **`MenuItemRow.tsx`** — `allergenLabels[a]` → `formatAllergen(a)` (the list display now takes a plain string).
- **`Menu.css`** — added `.ss-tags--allergen` / `.ss-tag--allergen` (red-tinted variant of the shared `.ss-tags` so the field keeps its food-safety identity rather than looking like the neutral ingredient chips).

Existing localStorage menu data deep-merges with seed, so no data wipe. Typecheck clean. No new files, no deps.

### Day 10 — Developer design-review reconciliation + editorial design pass (auth & dashboard) (2026-06-16)

Two threads: (1) reconciled the developer's `Design changes.pdf` review against the SOW, (2) a creative design elevation of the auth module and dashboard using the `frontend-design` skill.

**Developer design-review (`Design changes.pdf`, 7 items) — cross-checked vs SOW v2, verified in-browser.**
All 7 items turned out to be **already implemented in the uncommitted Day-9 working tree**; this session verified each live in a headless Chrome (puppeteer-core driving the running Vite app) rather than re-building:
1. Email verification flow — `pages/auth/VerifyEmail` ✅
2. Forgot-password flow — `ForgotPassword` + `ResetPassword` (SOW §5.1 explicitly allows it) ✅
3. Restaurant table creation — `useTables` + `TableDrawer` ✅ (NOT in SOW — net-new; waiter free-types table # per §4.2.1)
4. Add-lesson vs assign-lesson split — `LessonAssignDrawer` ✅ (minor UX divergence from §5.5.1's single form)
5. SOP document → LLM-extracted stages+rules, manager edits/adds — `mock/sop.ts` stages→rules + `SopUpload`/`SopStageCard` ✅ (extends §5.3.3's flat step form)
6. Service Errors panel removed from dashboard ✅ — **direct divergence from SOW §5.4.2** (which lists it as required). Decision: **follow the developer over the literal SOW**; the §5.4.1 before/after "Service Errors" KPI tile is **kept** (only the standalone panel is gone).
7. Waiter invite-success modal — `InviteSuccessModal` + `Modal` primitive ✅
   - Decision recorded: when the dev PDF conflicts with SOW v2, the dev PDF wins (it post-dates the doc and reflects the running product).

**Design system extended — "The Maître d' / Service Report" editorial language (via `frontend-design` skill).**
Kept Arivex strictly (forest + gold + cream, DM Serif Display + Outfit); the new layer is an *editorial, printed-menu* sensibility now shared across auth + dashboard.

- **Auth module redesign** (`Login.css` rewritten, `LoginBackdrop.tsx`, `AuthBrandPanel`, all 5 screens inherit it):
  - Brand panel reframed as a **printed-menu cover**: embossed gold hairline **frame** with engraved corner brackets, vertical letterspaced **"ServeSense" spine**, oversized serif headline, a giant serif **"S" watermark** bleeding off the corner, and Roman-numeral **"courses"** (replaced the `01/02/03` list). Uses the `--atmosphere-dark` / `--glow-*` / `--dot-grid-dark` / `--tex-grain` tokens.
  - **Iterations from stakeholder feedback:** (a) the secondary screens' confirmation states (forgot "sent" + verify-email) were tried left-aligned then reverted to **centered + polished** — refined gold-ringed mail icon, centered gold "menu-divider" hairline under the heading, logo **centered** as the brand anchor (kept rather than removed so narrow screens, where the brand panel is hidden, still show branding); (b) removed the gold hairline that sat under the brand eyebrow (`.ss-login__headline::before`); (c) improved the `.ss-auth__text-btn` ("Use a different email") hover visibility → `green-100` pill + inset ring.
- **Dashboard redesign** (`Dashboard/index.tsx` + `Dashboard.css`) — "Service Report":
  - Editorial **masthead header** (gold-tick eyebrow "Performance Report" replacing "Manager · §5.4"; gold hairline rule fading right beneath the header), **"menu-divider" hairline** under each section head, **inset gold frame** on the dark revenue hero (same motif as the auth panel).
  - **Iterations from feedback:** big gold serif Roman-numeral section indices (I / II) were added then **removed**; the §5.4.2 filter controls (category / staff selects + Export CSV) restyled into **sleek consistent pills** (38px, fully-rounded, `shadow-xs`, Export gained a download icon), scoped under `.ss-dash__filters` so the shared Select/Button primitives are untouched.

All work design-data only; typecheck clean throughout. No new dependencies.

### Day 9 — Auth flows, SOP document-extraction restructure, Tables, Modal, drawer splits (2026-06-15)

A feature day layered on top of the v2 build. **Recovered after an accidental power loss** — all working-tree changes were intact on disk except `SOP.css`, whose new component styles (`.ss-sop__source`, `.ss-stage`, `.ss-rule`, `.ss-sop-upload*`, `.ss-sop__add-stage-row`) were never saved; the restructured SOP page/components compiled but rendered unstyled. The CSS was rebuilt in the existing token vocabulary (source banner mirrors the old orientation-banner language; the upload drop/extraction states mirror the M4 Menu upload). Typecheck + production build clean (~588 kB JS / 172 kB CSS).

**Auth — full account-lifecycle flows (SOW v2 §5.1).** New `pages/auth/` directory: `ForgotPassword`, `ResetPassword`, `VerifyEmail`, plus a shared `AuthBrandPanel` (the login left-panel brand lockup extracted for reuse, reusing `LoginBackdrop` + `TextReveal`) and `Auth.css`.
- `auth.tsx` — `AuthUser` gained `emailVerified` (existing logins assumed verified; fresh registrations start `false`); context gained `markEmailVerified()`, `requestPasswordReset(email)`, `resetPassword(password)` (all mock/simulated, Firebase-shaped per §5.1.1).
- **Sign-Up** now routes to `/verify-email` (passing the email via router state) instead of straight to the dashboard.
- **Login** gained a "Forgot password?" link (`.ss-login__forgot`).
- **Routes** — `/forgot-password` + `/reset-password` under `PublicOnlyRoute`; `/verify-email` sits outside both guards (account is authenticated but unverified right after sign-up).
- Design-preview affordances throughout (no real email sent): "Open reset link" / "I've verified — continue" stand-ins, 30s resend cooldown on verify.

**SOP — flat steps → document-fed stages-with-rules (§5.3.3, dev-extended).** The biggest change. Manager uploads a service document; an LLM "extracts" the flow as **stages** (Greeting, Seating, …) and, within each, the **rules** the AI checks live (priority `must`/`should` + instruction + optional verbatim script).
- `mock/sop.ts` rewritten: `SopStep` → `SopStage` (holds `SopRule[]`) + `SopSource` + `SopState`; storage `ss_mock_sop_v2` → `ss_mock_sop_v3`; `simulateSopExtraction()` added; hook surface expanded (stage CRUD + reorder + per-stage rule CRUD + `setFromUpload`/`clearSource`; `stats` now `{ stageCount, ruleCount, mustCount, totalWeight }`). Seeded as if extracted from `brasa_service_sop_2026.pdf`.
- Deleted `SopStepCard.tsx` + `SopStepDrawer.tsx`; added `SopStageCard.tsx` (inline-editable stage: name input, reorder/delete, outcome + weight, rule rows with priority select) and `SopUpload.tsx` (drop → simulated extraction, PDF/DOCX/TXT).
- `pages/SOP/index.tsx` — no-source → full-bleed upload empty state; with source → source banner (filename + "uploaded N ago · N pages") with Replace (Drawer + compact `SopUpload`) + remove, overview stats, editable stage list, "+ Add stage".

**Restaurant Tables — floor plan (NOT in SOW v2; dev request).** New `mock/tables.ts` (`useTables`, storage `ss_mock_tables_v1`) + `TableDrawer.tsx` (number / seats / section / active, case-insensitive duplicate-number guard). Restaurant page gained a Tables section below the profile card: section-grouped grid of clickable table chips (number + seat count, inactive dimmed) + "active · seats" badge. Rationale: the waiter app can later pick a table from this list instead of free-typing the session table number.

**Coaching — assignment split out of the editor.** New `LessonAssignDrawer.tsx` — a dedicated staff-assignment surface (edits only the lesson's `assignments` array; all other fields pass through). `LessonDrawer` lost its `staff` prop + the inline staff picker (now create/edit content only). `LessonCard` gained an `onAssign` action.

**Staff — invite-success confirmation.** New `InviteSuccessModal.tsx` (+ `.css`) using the new `Modal` primitive — shown after adding a *new* waiter (edits still toast), with an "Add another" path. Drove the creation of the shared `Modal` primitive.

**Dashboard — Service Errors panel removed.** Dropped the "Service errors" panel from `Dashboard/index.tsx`, the `ServiceError` type + `serviceErrors` seed from `mock/dashboard.ts`, and the service-error rows from the CSV export.

### Day 8 — Module 8: in-app notification surface (2026-06-09)

The last open v2 item. The §7 Notification System matrix lists 11 events; **7 target the Manager (Dashboard ✅) column** — those are the manager web app's responsibility. Built the in-app feed for exactly those 7 (push + most email are Phase 2 per the doc's "Email + in-app only for MVP" note, so out of scope here).

**`lib/mock/notifications.ts` — `useNotifications()`** (storage `ss_mock_notifications_v1`, seed + localStorage pattern mirroring `useLessons`).
- `NotificationType` union = the 7 dashboard events: `post_session_scores`, `coaching_assigned`, `waiter_created`, `waiter_deactivated`, `menu_sop_updated`, `baseline_calculated`, `weekly_summary`. Each carries `notificationMeta` (label + tone) + a `toneColor` map.
- `AppNotification` = `{ id, type, title, body, createdAt, read, link? }`. `link` deep-links the row into the relevant module (`/performance/:staffId`, `/coaching`, `/staff`, `/orientation/menu`, `/dashboard`).
- Returns `{ notifications (sorted newest-first), unreadCount, markRead, markAllRead, remove, clearAll }`. `timeAgo()` helper for relative stamps.
- 9 seeded events tied to the Brasa waiter seeds, mixed read/unread, spread over the last week so the bell lands with a live unread count.

**`components/layout/NotificationMenu.tsx` + `.css`** — topbar bell with spring-in unread badge (`9+` cap), `scaleIn` dropdown panel (380px, own click-outside + ESC). Each row: tone-tinted per-type icon tile (inline SVGs), title, 2-line clamped body, `label · time` meta, unread dot + green-50 wash on unread rows. Header with "N new" pill + "Mark all read"; "You're all caught up" empty state. Clicking a row marks it read and navigates to its `link`.

**`Topbar.tsx`** — mounted `<NotificationMenu />` left of the profile; split the old single `menuRef` wrapper into a plain `.ss-topbar__right` flex row holding the bell + a new `.ss-topbar__profile-wrap` (relative, owns the profile-menu ref) so the two popovers have independent outside-click handling.

Typecheck + production build clean. Bundle ≈ 561 kB JS / 164 kB CSS. **All v2 manager-web modules (1–8) now complete.**

### Day 7 — SOW v2 restructure (2026-06-08)

A new **`Servesense_BRD_SOW_v2.docx`** (Version 2.0, June 2026) superseded the old `SOW.pdf` (v1.1). Did a complete module-by-module gap analysis and restructured the manager web app to follow v2 **strictly** — removing anything not in the doc and adding what was missing. Engagement is still the **Vite + React manager dashboard with mock data** (the v2-mandated Next.js + Tailwind / NestJS / Firebase / Pinecone stack is treated as a later backend-integration concern, by decision).

Key v2 deltas that drove the work: **single restaurant per account, no outlets**; **US market** (English UI, USD, NYC Spanish-tapas seed brand "Brasa Spanish Kitchen"); **self-service signup, no super-admin**; **orientation is editable CRUD again** (v2 §5.3 — the Day-4 "PDF-fed read-only" model was wrong); **§ references renumbered** (Manager modules now §5.x, AI/KPI §6.x).

**Module 1 — Outlet entity removed.** Deleted `Outlet`, `useOutlets`, `usePrimaryOutlet`, `PRIMARY_OUTLET_ID`; dropped `outletId` from staff + sessions; folded the address into `RestaurantProfile` (single inline card). Seed US-ized (USD, `America/New_York`, NYC address).

**Module 2 — Sign-Up page** (`/signup`, §5.1.2). Two-step flow (About you → Your restaurant) with progress bar, brand step-rail, slide transitions; all v2 fields incl. password rule (8+ / upper / number / symbol). `auth.tsx` gained `register()` (role `owner`) which seeds the restaurant name/address; login links to it and dropped the super-admin copy. Role union `manager | owner` (was `super_admin`).

**Module 3 — Orientation reverted to editable CRUD** (the big one; deleted the entire PDF-fed read-only architecture: `OrientationSourceBanner` / `OrientationUpload` / `OrientationReplaceDrawer` / `useOrientationSource` / `Policies/Display.tsx` / the `PhraseList` primitive).
- **Policies** (§5.3.1) → flat CRUD list of records (Type / Title / Description / Status) + `PolicyDrawer`. Storage `ss_mock_policies_v2`.
- **Menu** (§5.3.2) → editable items; shared **`MenuItemForm`** used by the Add/Edit drawer *and* the upload→parse→review flow (`MenuUploadDrawer`). Dish Type = Veg/Non-Veg only, **spice level removed**, Taste = 6 options, **Allergens = 13, mandatory (blocks save)**, flags = Is Special / **Is High Margin** / **Chef's Pick** (3rd added per §4.3.4), Active/Inactive status, USD. Storage `ss_mock_menu_items_v3`.
- **SOP** (§5.3.3) → reorderable steps (Name / Description / Expected Outcome / **Scoring Weight**) + `SopStepDrawer`; phrase lists + enabled toggle removed. `ss_mock_sop_v2`.
- **Tone** (§5.3.4) → 3 aspects (Trained Behavior + Purpose) + `AspectDrawer`; **Difficult-Situations playbook + phrase lists removed**. `ss_mock_communication_v2`.
- **Excellence** (§5.3.5) → 4 areas (Focus) + `AreaDrawer`; brand-principle hero + phrase lists removed. `ss_mock_excellence_v2`.
- **Sales Goals** (§5.3.6) → rebuilt `GoalDrawer` (Name / Type / Target Items from active menu / Target Value / Validity Period); `description` + `isEnabled` removed. `ss_mock_sales_goals_v2`.

**Module 4 — Staff** (§5.2). Role → **Waiter only**; list columns Name / Email / Role / Status / Sessions / **Avg Overall Score** / **Last Active** + sort (name/score/last-active/sessions); model gained `lastActiveAt` + `avgOverallScore`; 10 US waiter seeds; email-invite copy. `ss_mock_staff_v3`.

**Module 5 — Coaching** (§5.5). Lesson types restricted to **Tone / Empathy / Menu Knowledge / Upselling** (Safety + SOP removed); **duration removed**; **Mapped KPI** is a real field + shown on the card; list reflects Category / Mapped KPI / Assigned Count / Avg Completion. `ss_mock_lessons_v2`.

**Module 6 — Dashboard** (§5.4). Dropped the **"CoreVista"** label; 5 before/after metrics match v2 (incl. Customer Satisfaction); **CSV export** + **category/waiter filters** added (§5.4.2); currency → **USD** (`formatINR`→`formatUSD`), category/item data rebranded to the Spanish-tapas menu.

**Module 7 — Performance** (§5.4.3). Composite "health score" → **Overall Score** weighted per **§6.4** (added `sopCompliance` KPI so the formula is exact); **7/30/90-day trend graphs** (`TrendChart` small-multiples) + **coaching assignments/completion** added to the drill-down; list cards surface the §5.4.3 KPI set; US guest names + baselines for all 10 waiters. `ss_mock_performance_v3`.

**Cross-cutting**
- **`PhoneField` primitive** — shared dial-code (+1 default, MX/ES/UK) + number field used in Sign-Up, Staff drawer, and Restaurant profile. Fixed a nested green focus-ring (global `:focus-visible` hit the `<select>`).
- Sign-up scroll fix: page locked to viewport, **form panel is the only scroll surface** with a sleek scrollbar; scroll-safe `margin:auto` centering so the top never clips on errors.
- ~~Still **pending: Module 8 — in-app notification surface (§7 matrix).**~~ Shipped Day 8 (see below).
- Every module: typecheck + production build clean. Bundle ≈ 546 kB JS / 156 kB CSS.

### Day 1 — M0 through M7 complete

**Foundation work (M0)**
- Vite + React + TS frontend, Express + TS backend, MySQL schema scaffolded
- Arivex design tokens system (colors, type, spacing, motion, layout, shadows, z-index)
- DM Serif Display + Outfit loaded from Google Fonts
- 4 base primitives shipped (Button, Input, Card, Badge)
- App-shell layout (forest sidebar, top bar, content), routing, auth scaffolding

**Auth + animation (M1)**
- `framer-motion` + `clsx` installed
- Awwwards-level login: animated gradient mesh backdrop, word-by-word text reveal (clip-path slide), staggered form entry, gold accent italic for second line
- AuthContext + ProtectedRoute + ToastProvider
- Mock backend endpoint `POST /api/auth/login` returns real JWT + derived user
- Full validation system with touched-state tracking and inline per-field errors

**Restaurant + Outlets (M2)**
- View / edit mode swap (AnimatePresence cross-fade)
- Logo drop zone with drag-drop animation
- Outlet drawer with full address + status form
- Cards in a responsive grid; inline availability switch on each
- Hover affordances (slide-in "Edit →" hint)

**Standard Policies (M3)**
- Two-column settings shell: sticky left nav (with `layoutId` active pill + animated progress bar) + right content card
- 7 policy sections, each with its own form (7-day operating schedule, waiting, reservation, table holding, dining rules, accommodation, payments)
- Cross-section transitions via AnimatePresence
- Initial TimePicker → later replaced with portal-based v2 (see polish)

**Menu Knowledge (M4)**
- Hero stats strip + search + dish-type pill rail + sliding category-chip filter
- Initial card grid → later replaced with **grouped list view** (category sections → rich rows) for better at-scale management
- DishMark icon component (Indian-regulatory-style square + leaf for vegan), spice meter (flame SVGs scaling color cold→hot), allergen pills
- Add/Edit drawer with: tag-input ingredients, allergen checkbox grid, taste-profile chip set, status row
- **PDF Upload drawer** with three phases (drop → simulated extraction with spinning ring + animated SVG path strokes → review list with per-item checkboxes)

**Service SOP (M5)**
- Vertical timeline: 10 steps with serif circular badges + gradient connector lines
- Each step expands inline; description editor + 3 PhraseLists (best practices / things to avoid / example phrases)
- Switch toggles step enabled state; disabled steps fade to 55%
- Overview row: active steps / customised / SOP weight / animated progress bar

**Communication & Tone (M6)**
- Section §1: 3 aspect cards (Tone / Language / Listening) with custom SVG icons (sound wave / speech bubble / ear with arcs)
- Section §2: Difficult Situations Playbook — 6 seeded scenarios; filter rail with sliding pill (layoutId); each scenario card has trigger signals (red) + recovery phrases (gold italic) inline
- Promoted `PhraseList` from SOP into a shared primitive

**Best Practices & Excellence (M7)**
- Tier visual shift to gold accents (icons, hover borders, footer pill)
- Brand-principle hero card: gold quote-mark icon tile + radial gold wash + editable serif-italic field at `clamp(1.25rem, 2vw, 1.6rem)`
- 4 area cards in 2×2 grid (Anticipation / Peak Hours / VIPs / Recovery) with custom SVG icons (radar / lightning / sparkle star / shield-with-heart)
- Three PhraseLists per area: Hallmarks / Recognition triggers / Signature phrases

### Polish passes captured during Day 1
- **Typography overhaul**: serif reserved for h1/h2 only; card titles + sub-heads moved to Outfit semibold (eliminates the spiky multi-card-grid clutter); muted body weight reduced to 300; fluid clamp scales added for headings
- **Validations**: full per-field inline error system on login with touched tracking, format validation (email regex / phone), helpful hints when valid
- **TimePicker v2**: replaced first iteration's scroll columns with a modern preset-first design — 6 common restaurant times in a 3×2 grid + custom HH:MM stepper with sliding AM/PM toggle
- **TimePicker portal fix**: rendered into `document.body` via `createPortal` with viewport-fixed positioning + smart flip-above-when-no-room-below — escapes any ancestor `overflow: hidden` (the schedule grid's rounded corners were clipping it)
- **Menu list view**: replaced original card grid with a denser grouped-by-category list — far more scannable for at-scale management
- **App-shell scroll pattern**: viewport locked; only the content pane scrolls; sleek custom scrollbar (10px pill thumb, warm-gray with inverted-white variant on dark surfaces)
- **Sidebar logo**: matched to login form logo (forest gradient + cream "S" instead of gold)
- **Toast position**: moved from top-right to bottom-right
- **Branding fixes**: removed decorative gold blob on restaurant card; restored login hero title visibility (was forced dark by an over-eager global heading color)

### Day 2 — M8 through M12 complete + design-system pass

**Sales Goals & Campaigns (M8)** — `/orientation/goals`
- Card grid layout: hero stats strip (active count, orders toward target, avg progress, total goals), sliding-pill status filter (All / Active / Upcoming / Ended), `+ New goal` CTA
- GoalCard: type+status badges, name, description, progress readout with serif numerals + gradient progress bar (green→gold at completion), target-item chips, date range, hover-reveal edit hint, paused/ended dim state
- GoalDrawer: name + description + Daily/Weekly segmented control with `layoutId` pill, target value + date range row, grouped item picker with search filter and per-category headers
- 4 seeded goals tied to existing menu-item IDs

**Staff Management (M9)** — `/staff`
- 7-column table view (avatar + name+email / role / outlet / status badge / last seen / sessions / chevron); deterministic avatar tint hashed from staff ID
- Toolbar: search + outlet `Select` + status pill rail (All / Active / Pending / Inactive)
- StaffDrawer: identity preview chip, gold "invite pending" banner with **Resend invite** button on pending records, name/email/phone/role/outlet form with touched-state validation, inline performance preview tiles (sessions / tone / empathy / upsell) for accepted staff, status toggle
- 10 seeded staff across both outlets (waiters / receptionist / bartender; mix of active/inactive/pending)

**Knowledge & Coaching (M10)** — `/coaching`
- Category filter rail (Tone / Empathy / Menu / Upsell / Safety / SOP) with per-category accent colors via inline `--lesson-accent` CSS var
- LessonCard (compact horizontal): small 110×62 16:9 YouTube thumbnail with hover play overlay anchored top-left; meta line (category dot + name · duration); title (2-line clamp); description; assignee avatar stack (overlap, max 4 + "+N"); progress bar + %; bottom 52px action bar with labelled status switch (● Active / ● Archived) + explicit Edit→ CTA
- LessonDrawer: live YouTube thumbnail preview with category banner; title / description / URL with detected video-ID hint; category + KPI + duration row; staff multi-select picker with avatars + per-assignment status (Completed / X% / Not started); active toggle
- 7 seeded lessons across all 6 categories with realistic per-staff completion records
- YouTube URL parsing handles `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/v/` formats

**Manager Dashboard (M11)** — `/dashboard`
- **Section A · ROI**: dark forest hero card with sparkline as integrated background watermark + radial gradient vignette overlay; serif Additional Revenue value (`clamp(2.6rem, 5.2vw, 4rem)`); trend pill with backdrop blur; before/after stack on the right (`BeforeAfterBar` component — paired bars + delta pill); 5-tile CoreVista KPI grid (Upsell Success / Avg Order Size / Customer Sat / Service Errors / Staff Confidence) each with accent icon, top stripe and `--kpi-accent` tone
- **Section B · Revenue & Sales**: interactive CategoryDonut (200×200 viewBox, hover scales slice + dims others + center label switches to show that slice's category share %); legend synced bidirectionally with donut hover; Top-selling items chart (top 3 only, gold gradient bars with rank numerals tight against label); clean Service errors list (title+desc / count / trend pill — flush left, no icon column to avoid the heavy inset that earlier iterations had)
- Period picker (`7d` / `30d` / `90d`) with sliding pill; metrics scale per period via `useDashboardMetrics(period)`
- Charts inline SVG only — `Sparkline` uses Catmull-Rom cubic Bezier smoothing with `vector-effect: non-scaling-stroke` so curves stay crisp at any container width

**Staff Performance & Drill-Down (M12)** — `/performance` + `/performance/:staffId`
- List view: 4 stat tiles (Active staff / Total sessions / Avg upsell / Avg rating), search + outlet `Select` + sort dropdown (Health / Sessions / Upsell / Rating / Tone), responsive grid of perf cards with composite health score (weighted blend of tone, empathy, menu knowledge, confidence) tone-coded green ≥85 / gold ≥70 / danger <70
- StaffDetail page: tinted identity hero (avatar + role + outlet + last-active + big health score), 10-tile aggregated KPI grid (sessions / upsell rate / missed opps / confidence / menu / tone / empathy / food safety / consistency / rating), filterable sessions table (search + lunch/dinner pills) with click-to-open rows
- SessionDrawer: header summary (table + guest + service + duration + star rating), 9-cell KPI grid each with per-cell mini progress bar (green/gold/red by score), highlights list (positive green / negative red with leading icons), transcript preview block
- 6–10 sessions per staff seeded deterministically — each baseline tied to that staff's profile so high-performers stay high across the data, struggling staff stay struggling. ~60 sessions total carrying the full §7 KPI library.

### Design-system passes captured during Day 2

- **Card surface system overhauled to match Arivex exactly** (after pulling actual CSS from arivex.net):
  - New tokens in `tokens.css`: `--shadow-card: 0 8px 40px rgba(15,26,18,.08)`, `--shadow-card-hover: 0 16px 48px rgba(15,26,18,.10)`, `--border-card: 1px solid rgba(58,107,76,.08)`, `--color-card: #ffffffe6` (translucent white that picks up cream warmth)
  - Card primitive + every card-level surface across the platform (Restaurant, SOP, Goals, Excellence, Menu, Staff, Coaching, Communication, Policies, Dashboard, Performance) migrated to the new tokens
  - Radius bumped to `--radius-xl` (16px, was 12px) on main cards to match Arivex's 16px corners
  - Hover universally lifts `translateY(-4px)` with deeper shadow

- **Typography weight pass** (after user feedback that text felt thin):
  - `--fw-muted` bumped 300 → **400** (regular) for better readability of helper / hint / stat text — most "muted" UI text was previously 300 which felt anemic
  - New `--fw-prose: 300` introduced as an explicit opt-in for long-form editorial paragraphs (.lede, .muted-body utility classes)
  - Body explicitly sets `font-weight: var(--fw-body)` + `line-height: 1.6` + `font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1` matching Arivex's body exactly

- **Global underline scoping fix**: removed `text-decoration: underline` from default `a:hover` — was bleeding into every `<Link>`-wrapped card across the app. Underlines now opt-in via `.text-link`, `p > a`, and `.ss-card__description a`.

- **Dashboard polish (multiple iterations)**:
  - Sparkline distortion fixed: replaced sloppy Q-curve interpolation with proper Catmull-Rom cubic Bezier + `vector-effect: non-scaling-stroke` so curves and endpoint dots don't stretch into ovals when the SVG fills its container
  - Removed decorative corner blob on KPI tiles (the `::after` radial gradient — felt visually noisy)
  - Service errors panel rebuilt twice: first removed the broken grid layout (count was floating center because of misplaced grid-row spans on grandchildren), then dropped the icon column entirely so title text sits flush at the panel's padding edge instead of being inset 60px+ from the card edge
  - Top-selling items capped at 3 (was 6); rank column collapsed (no `min-width`, smaller font) so rank+title read as one tight unit
  - Donut + bar chart hover states synchronized — hovering a legend row scales the matching donut slice and dims others; hovering a bar row brightens it and dims the rest

- **Lesson card layout iteration** (3 designs tried; final = compact horizontal):
  - V1 vertical (full-width thumbnail on top) → too tall, video dominated
  - V2 small-thumbnail header layout → adopted; thumb anchors top-left as a visual chip, content leads
  - "Maps to → KPI" chip removed per user request (felt redundant — KPI is configured in the drawer)

- **Performance card hover effect**: top accent stripe animates 3px → 5px, soft radial halo in the staff's tier color fades in, name shifts to accent color — synchronized transitions on `--duration-base` ease-out

### Day 6 — Atmosphere & texture pass + dashboard graph overhaul (2026-06-02)

A design-system refinement day focused on **atmosphere & texture** (keeping the DM Serif + Outfit pairing as-is), followed by a dashboard UI/graph enhancement pass driven by stakeholder feedback against the in-browser build.

**Atmosphere & texture — promoted from login-only into the token system**
The login brand panel was the only surface with real depth (grain + gradient wash + radial glows); every dashboard page sat on flat cream. Lifted that language into reusable tokens and applied it app-wide with luxury-grade restraint (everything at single-digit opacity — "warm light on linen", not noticeable decoration).
- New tokens in `tokens.css` under an **Atmosphere & texture** section:
  - `--tex-grain` (inline SVG fractal-noise data-URI) + `--tex-grain-opacity` (0.05, dark surfaces) / `--tex-grain-opacity-soft` (0.035, light surfaces)
  - `--atmosphere-page` — layered warm wash (lighter pool top-left, gold whisper top-right, sage breath rising from base)
  - `--atmosphere-dark`, `--glow-gold`, `--glow-green`, `--dot-grid-dark` — the dark-surface recipe distilled from the login panel
  - `--sheen-card` — `inset 0 1px 0 rgba(255,255,255,.7)` top-edge highlight
- **App shell** (`AppShell.css`): `.ss-shell__main` now carries `var(--atmosphere-page)` over `--color-bg`; a `::before` grain layer sits at **z-index 0 behind content** so surfaces feel like warm stock while text stays crisp. `.ss-shell__content` lifted to z-index 1; `.ss-topbar` given `position: relative` to activate its existing (previously inert, because static) `z-index` and sit above the grain.
- **Card primitive** (`Card.css`): every card composes `--sheen-card` into its `box-shadow` (all elevation variants + interactive hover) so cards read as lifted physical surfaces, not flat white blocks.
- **Sidebar** (`Sidebar.css`): flat `green-900` → `var(--atmosphere-dark)` with `isolation: isolate`; two `z-index: -1` pseudo-layers (glow + dot grid on `::before`, grain on `::after`) — no nav markup touched. Unifies the sidebar's voice with the login brand panel.
- **Follow-up fix**: removed the `--glow-gold` layer from the sidebar `::before` — the gold pool up top was tinting the "ServeSense / MANAGER" brand lockup. Sidebar now keeps only the sage glow + dot lattice.

**Dashboard (M11) — UI / layout / graph / interaction enhancement (data unchanged)**
All numbers stay sourced from `useDashboardMetrics`; only presentation changed.
- **Revenue-by-category donut** (`Charts.tsx` `CategoryDonut`): rebuilt as a modern **segmented ring** — slice gaps (6px), rounded caps, recessed track groove. Hover **swells the slice thickness** (20 → 27px, animated) and dims others to 0.4 with a soft colored halo; entrance animates `strokeWidth` from 0. Center now defaults to **Total ₹-value** and swaps to the hovered slice's **share %** + name. `r` reserves room for the swell so it never clips. Center props in `index.tsx` changed from "Top / category name" → Total revenue.
- **CoreVista KPI tiles** (`index.tsx` `KpiCard`): added a **previous→current mini progress viz** — accent-toned fill (`color-mix` with white → accent) to the current value over a track, with a `green-900` baseline **tick** marking the previous value. Scale per unit (pct→100, rating→5, rupees/count→relative). Footer "From X" gained a marker dot; hover lift deepened to -4.
- **Before/After** (`Charts.tsx` `BeforeAfterBar` + `index.tsx`): replaced the two stacked sub-cards with **one grouped panel** ("Before vs after ServeSense" header + Baseline/Lift legend). Each metric is now a single split bar telling a story: **green baseline segment + gold "lift" segment** = the jump ServeSense added, with a `Before → After` readout beneath and a gold-toned delta pill. CSS fully rewritten (`.ss-ba__track` / `.ss-ba__seg--base|--lift` / `.ss-ba__readout` / `.ss-ba__point`), old `.ss-ba__row|__tier|__bar` rules removed; obsolete 720px `.ss-ba__row` media rule cleaned.
- **Top-selling items** (`BarRowChart`): surfaced the existing-but-hidden `units` field as a muted "N sold" second line under each revenue figure (new optional `subText` on `BarRow`; `.ss-bars__value-block` / `.ss-bars__sub`). Bars kept static (honoring the Day 3 "quiet ranked list" decision).

**Revenue hero sparkline — three reported defects fixed** (`Charts.tsx` `Sparkline` + CSS)
Root cause of the oval dot + edge gap: the SVG uses `preserveAspectRatio="none"`, which stretches the viewBox non-uniformly (squashing an in-SVG `<circle>` into an oval) and the old 8px horizontal padding left a gap at the card edge.
- **Oval dot → true circle**: endpoint dot moved out of the distorted SVG into a **screen-space `<span>`** (`.ss-spark__dot`, fixed 11px, `border-radius:50%`, concentric `box-shadow` halo replacing the old in-SVG glow circle). Positioned via `left/top %` matching the line's last-point fraction, so it lands exactly on the stroke end. `Sparkline` now returns a `.ss-spark` wrapper (relative) holding the svg + dot.
- **Right-edge gap**: dropped horizontal padding; line/fill bleed full-width. Area path extends flat to the right edge (`L VBW lastY …`) so there's no empty sliver, while a 12px `rightInset` keeps the dot fully inside the rounded card.
- **"Line not touching the dot"**: diagnosed (via a node calc of the seeded data) as a **contrast** issue, not misalignment — the final point is always the max, so the curve climbed to `y≈8%` straight into the dark top vignette, hiding the rise while the bright dot floated clear. Fixed by **compressing the trend into the lower-middle lit band** (`yTop=72 … yBottom=186`, peak now ~36% down), softening the top vignette (lit plateau 42–60% in `.ss-dash__revenue-glow`), and thickening the line 2 → 2.5px.

**Net**: tokens.css, globals/AppShell/Sidebar/Topbar/Card CSS, Dashboard `index.tsx` + `Charts.tsx` + `Dashboard.css`. No new files, no deps. Typecheck + production build clean throughout (bundle ~544 kB JS / 158 kB CSS).

### Day 5 — Iteration on top of orientation refactor

A long polish + feature day layered on the new PDF-fed orientation structure. Most of these were driven by stakeholder feedback against the in-browser build (drawer felt cramped, filters felt heavy, multi-outlet was premature, staff invite flow wasn't going to ship Phase 1).

**Upload card padding — uncovered an undefined-token bug**
- The Replace PDF drawer's drop card was visually flush against the drawer header and footer. First fix was outer breathing room on `.ss-orient-upload--replace` (`padding: var(--sp-3) 0 var(--sp-4)`).
- That exposed the real issue: the inner card had `padding: var(--sp-9) var(--sp-6)` but `--sp-9` was never defined in `tokens.css` — same with `--sp-7` used in the replace override. Both fell back to `0`, so the cards had been rendering with **zero vertical padding** all along.
- Fixed by switching to defined tokens: `--sp-10` (40px) for both empty-state and processing variants, `--sp-8` (32px) for the compact replace overrides.
- Also added `.ss-orient-upload--empty { padding: var(--sp-4) 0 var(--sp-6) }` so the inline page-level empty state has its own breathing room from the page header above.

**Menu — dropped dish-type filter rail**
- Removed the All / Veg / Vegan / Non-veg / Seafood / Egg pill rail and ~60 lines of related CSS. The grouped category list + search are enough for at-scale management on a single outlet.

**Orientation flow — empty state first + delete action**
- Source PDF seeds in `useOrientationSource` flipped from populated metadata → `null` for all 6 modules so a fresh visit lands on the upload empty state.
- Added `clearSource` to the hook; surfaced as a small trash-icon button on `OrientationSourceBanner` (new `onRemove` prop). Each of the 6 orientation pages wires `handleRemove` with a confirmation toast.
- One-time migration (`STORAGE_VERSION = 2`) wipes the previously-seeded source keys from existing browsers so the empty-first flow lands on every device, not just incognito.

**Single outlet per manager**
- Phase 1 ships with one outlet; multi-outlet is deferred. Data model preserved (`outletId` stays on staff + sessions) so this isn't a breaking change for the future.
- `mock/restaurant.ts`: trimmed seed to one outlet, exported `PRIMARY_OUTLET_ID` constant, added `usePrimaryOutlet()` (returns the single outlet + an `updateOutlet(patch)`). `useOutlets()` kept for sessions/staff lookups, auto-migrates any stored multi-outlet array down to the primary. Dropped `upsertOutlet` / `removeOutlet` / `toggleOutletStatus` / `newOutletId`.
- **Restaurant page**: replaced multi-outlet grid + drawer with one inline outlet card (view ↔ edit toggle mirroring the profile section above it). Header copy updated, "Single outlet · Phase 1" badge.
- **Staff page**: dropped the outlet `Select` filter and the Outlet column. Grid template `staff | role | outlet | status | last seen | sessions | chev` → `staff | role | status | sessions | chev`.
- **StaffDrawer**: dropped the Outlet `Select` field, the `outlets` prop, and the outlet error. New staff auto-assigned to `PRIMARY_OUTLET_ID`.
- **Performance list**: dropped outlet filter; PerfCard sub-line no longer shows outlet name.
- **StaffDetail**: dropped outlet from the hero eyebrow.
- **Layout copy**: Sidebar + Topbar "Restaurant & Outlets" → "Restaurant". Dashboard lede + Login marketing copy desaturated of multi-outlet language.
- Mock seed: all 10 staff and ~60 sessions migrated to `outlet_001`.
- Deleted `OutletCard.tsx` and `OutletDrawer.tsx`.

**Performance period filter — three iterations to land on Notion-style**
1. **First**: Monthly / Yearly / Overall sliding-pill picker mirrored from the Dashboard. Required re-spreading the session seed over the last 18 months with a `pow(t, 2.2)` recency-biased curve and bumping count from 6–10 → 24–36 per staff so the three options had visibly distinct totals. Storage bumped to `ss_mock_performance_v2`.
2. **Second**: replaced with a custom filter — a popover with four mode tabs (Range / Month / Year / All) and mode-specific inputs. Worked but stakeholder feedback said it was "very confusing." Tabs forced you to think about WHICH mode before you could pick a date.
3. **Final**: rebuilt as a Notion-style preset list. One scannable column of named presets (`today` / `yesterday` / `last_7_days` / `last_30_days` / `this_month` / `last_month` / `this_year` / `last_year` / `all_time`), each row commits the filter immediately on click. Selected row gets a green-50 background + green-700 checkmark. **Custom range…** is the last item, separated by a divider — clicking it expands two date inputs (From / To) inline via framer-motion `height: 'auto'`.
- Data layer simplified to a 2-variant union: `{ kind: 'preset'; preset: DatePreset }` | `{ kind: 'custom'; from: string; to: string }`. A single `presetBounds()` helper compiles every preset down to `[start, end)` Date pairs so the filtering pipeline stays uniform.
- `describeDateFilter()` produces the trigger label ("Last 30 days", "May 1, 2026 – May 27, 2026", or "May 5, 2026" when from === to).
- Solid white background — the project's `--color-card` is `#ffffffe6` translucent (Arivex card system) so the page bled through the popover. Swapped to `--ss-cream-0` (`#ffffff`).
- Both pages default to `Last 30 days`.

**Removed Last seen column** from the staff table (and the matching grid template column + responsive media-query rule).

**Removed invite scenario from Staff Management**
- Schema lost `inviteStatus`, `invitedAt`, `lastLoginAt`, `InviteStatus`, `inviteStatusLabels`. Renamed the timestamp `invitedAt` → `joinedAt`. Storage key bumped to `ss_mock_staff_v2`. Two seed records previously marked `pending` converted to active accounts.
- `useStaff` lost `resendInvite`. Stats `{ total, active, pending, inactive }` → `{ total, active, inactive }`.
- Staff page: status filter rail is now `all / active / inactive` (3 chips, no Pending). Stats strip shrunk 4 → 3 tiles. Header badge updated. Empty-state copy moved from "invite first waiter" to "add first waiter".
- StaffRow: removed the "Invite sent" gold badge branch.
- StaffDrawer: removed the gold pending banner + Resend invite button. Title `Invite staff` → `Add staff`. Footer `Send invite` → `Add staff`. Performance preview gated only on `sessionCount > 0`.
- CSS: dropped `.ss-staff-row--pending` (gold gradient) and `.ss-staff-form__banner*` rules.

**Net file change**
- 3 files deleted across the session: `MenuItemDrawer`, `UploadDrawer`, `GoalDrawer` (Day 4) + `OutletCard`, `OutletDrawer` (Day 5).
- 1 file added: `client/src/components/primitives/DateFilterControl.tsx` (+ .css).
- Production bundle (Day 5 end): 543 kB / 166 kB gzipped — roughly flat with Day 4 despite all the new features, since the deleted drawers cancelled out the new DateFilterControl + period filter logic.
- Typecheck and production build clean throughout.

---

### Day 4 — Orientation refactored to PDF-fed read-only (SOW alignment)

The previous build treated every orientation module (M3–M8) as a CRUD surface — managers added items, edited descriptions, toggled steps on/off, etc. Re-reading the SOW (§2.3, §3) made the mismatch obvious: *"Manager feeds and maintains all operational data"* via uploaded documents (menu PDF, SOP, policies). The portal is the read-side; uploads are the only write. Day 4 made the codebase match.

**Shared infrastructure (new)**
- `components/orientation/OrientationSourceBanner` — top-of-page pill showing the active PDF's filename, relative upload time, page count, and a `Replace PDF` button. Forest-gradient subtle background, gold-ish PDF icon tile.
- `components/orientation/OrientationUpload` — drop-zone empty state and the body of the replace flow. Reuses the M4 PDF upload animation language (spinning ring + animated SVG document strokes + staggered "scanning… detecting… structuring…" lines), now generic over module label and hint.
- `components/orientation/OrientationReplaceDrawer` — thin Drawer wrapper.
- `lib/mock/orientationSource.ts` — `useOrientationSource(moduleKey)` hook. Six independent localStorage keys (`ss_mock_orientation_source_policies` etc.) so each module's source PDF is tracked separately. Seeded with plausible filenames so the default state already reads as a parsed document, not an empty page. `meta` lookup table provides per-module label, hint, and SOW reference (§3.1–§3.6) so the page eyebrow and upload copy stay in sync.

**Per-module conversion (M3–M8)**

- **M3 Policies** — Removed every Input/Textarea/Switch/Checkbox/TimePicker editor from the 7 policy sections. New `pages/Policies/Display.tsx` introduces a small set of read-only display primitives:
  - `Fact` / `FactGrid` — uppercase label above serif value, wrapped in a cream-background card with subtle border
  - `BoolPill` — green check pill when on, muted neutral X when off
  - `BoolGrid` — wrap-flex container for service-mode/restriction/accessibility/payment-method bool sets
  - `RulesBlock` — gold-left-rule blockquote pattern for multiline rules text (the "Reservation rules", "House rules", "Payment notes" fields)
  - The week-schedule grid kept its layout but TimePicker cells became formatted `12:00 PM` text; closed days get a "Closed" tag and muted column
  - Left nav lost its progress bar + per-section completion dots (completion was an editing concept; with PDF-fed content the doc either has a section or it doesn't)
- **M4 Menu** — Deleted `MenuItemDrawer.tsx` (add/edit form) and `UploadDrawer.tsx` (its bespoke phase 'drop → processing → review' flow is now the generic OrientationUpload). `MenuItemRow` lost its button-wrapping anchor, hover chevron, and the inline Switch toggling `isAvailable`. Header lost the `+ Add item` and `Upload PDF` buttons (the source banner's Replace CTA is the only entry path now). The rich grouped list view, allergy detection, spice meter, dish-type filters, category chip rail — all kept.
- **M5 SOP** — `SopStepCard` Textarea for description → plain `<p class="ss-sop-step__description">`. Switch (enabled/skipped) removed; disabled steps still dim and show a "Not in document" neutral badge. PhraseLists wrapped in `{phrases.length > 0 && …}` so unused step subsections are hidden cleanly. The expand/collapse toggle only renders when there *is* expanded content. Header bottom strip dropped the "% live" progress bar.
- **M6 Communication** — `AspectCard` Textarea → static paragraph; all three PhraseLists become `readOnly`. `SituationCard` lost the Input/Textarea/Select editors and the Remove button — title is a serif h3, context is a quiet bordered paragraph, the two PhraseLists are read-only. Header lost the `+ Add scenario` button; empty filter state now reads as "switch filter back to All".
- **M7 Excellence** — Brand-principle hero card's Textarea → static serif-italic `<p class="ss-principle__quote">` keeping the same fluid clamp size. AreaCard's standard Textarea → bordered paragraph; three PhraseLists per area become `readOnly` (and gated on `length > 0`).
- **M8 Sales Goals** — Deleted `GoalDrawer.tsx`. GoalCard lost the absolute-positioned invisible click hit-target, the `Switch` for pause/resume, the hover-revealed "Edit →" hint, and all the z-index gymnastics that made the whole card a button. The card is now a passive `<article>` with one inline `Paused in document` badge when disabled. Header lost the `+ New goal` button.

**Shared primitive change**
- **PhraseList** gained an optional `readOnly` boolean. When true, the input row at the bottom and the per-chip `×` remove buttons are skipped, but the chip rendering (with tone-coloured backgrounds, icons, layout animation) stays identical. This kept SOP/Communication/Excellence on a single source of truth instead of forking a display-only variant.

**Net code change**
- 3 files deleted (`MenuItemDrawer.tsx`, `UploadDrawer.tsx`, `GoalDrawer.tsx`)
- 5 files added (the four orientation components + the source mock hook + Policies/Display.tsx)
- Production bundle dropped from 569.86 kB → 542.85 kB (gzipped 173.48 → 166.47) — entirely from removing the editor-side forms and their drawer wrappers.
- Every typecheck pass clean; all 6 module pages render against their existing seed data with no shape changes — only display-side rewrites.

### Day 3 — Dashboard hover polish

**Donut chart (Revenue by category) — calmer hover**
- Replaced the stroke-width pop-out (`stroke + 4` on hover) + 32% dim of other slices with a single subtle `drop-shadow(0 0 8px <slice color>)` glow on the hovered slice. The geometry no longer shifts; only the hovered slice gets a soft halo.
- Center text still swaps to that slice's share % (the actual data feedback — kept because it's the useful part of the interaction).
- Legend: removed the `translateX(2px)` shift and the dim-others opacity rule; kept only the cream background highlight on the hovered row. Transition slowed from `--duration-fast` to `--duration-base` for a softer settle.
- Result: hover feels like a spotlight, not a reflow. One thing reacts, not five.

**Top-selling items (BarRowChart) — hover removed entirely**
- Stripped `hoveredId` state, mouse handlers, and the `--hover` / `--dim` className branches from the component.
- Removed the related CSS: label color shift, rank color shift, track height grow (8px → 10px), row dim opacity, and the `cursor: pointer`.
- Bars are now fully static — the chart reads as a quiet ranked list.

---

## Source Document
**Authoritative spec: `Servesense_BRD_SOW_v2.docx`** in the project root (Version 2.0, June 2026 — BRD & Statement of Work). The build was realigned to v2 on Day 7 (see Build Log). The older `SOW.pdf` (v1.1) is superseded — where this file's earlier sections still cite v1.1 § numbers or describe outlets / PDF-fed orientation / INR, the Day-7 entry and the actual code are the source of truth.
