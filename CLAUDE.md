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
| **M3** | Orientation › Standard Policies (MANDATORY) | §3.1 | ✅ Complete | `/orientation/policies` |
| **M4** | Orientation › Menu Knowledge + PDF upload (MANDATORY) | §3.2 | ✅ Complete | `/orientation/menu` |
| **M5** | Orientation › Service SOP — 10-step flow (MANDATORY) | §3.3 | ✅ Complete | `/orientation/sop` |
| **M6** | Orientation › Communication & Tone (MANDATORY) | §3.4 | ✅ Complete | `/orientation/tone` |
| **M7** | Orientation › Best Practices & Excellence (ADVANCED) | §3.5 | ✅ Complete | `/orientation/excellence` |
| **M8** | Orientation › Sales Goals & Campaigns | §3.6 | ✅ Complete | `/orientation/goals` |
| **M9** | Staff Management (create waiter, invite, active/inactive) | §2.2 | ✅ Complete | `/staff` |
| **M10** | Knowledge & Coaching Management | §2.6 | ✅ Complete | `/coaching` |
| **M11** | Manager Dashboard (ROI + Revenue & Sales Analytics) | §2.4 | ✅ Complete | `/dashboard` |
| **M12** | Staff Performance List & Drill-Down | §2.5 | ✅ Complete | `/performance` + `/performance/:staffId` |

All Phase-1 modules are now wired against mock data. M11 and M12 consume metrics the AI engines (Epic 4) will eventually produce — views render today against seeded data shaped to the final API contract, so swapping each hook for a real `fetch` is a one-line change per page.

---

## 13. Primitives Library

All primitives live in `client/src/components/primitives/`. They use design tokens, ship their own CSS file co-located with the component, and were built for reuse across the platform.

| Component | File | Used in |
|---|---|---|
| **Button** | `Button.tsx` | Everywhere — 5 variants (primary, secondary, ghost, danger, link) × 3 sizes; framer-motion `whileHover` lift + `whileTap` press; loading spinner state |
| **Input** | `Input.tsx` | Forms — label / hint / error states; 4px focus ring; brand-green label shift on focus; Chrome autofill override (inset shadow trick) |
| **Textarea** | `Textarea.tsx` | M2, M3, M5, M6, M7 — same focus system as Input |
| **Select** | `Select.tsx` | M2, M4, M6 — native select with custom chevron + matching focus ring |
| **Checkbox** | `Checkbox.tsx` | M3, M4, M6 — spring-animated check icon (scale 0.4→1 on toggle); label + description |
| **Switch** | `Switch.tsx` | M2, M3, M4, M5, M6 — spring-glided thumb (layout animation), label + description, sm/md sizes |
| **Card** | `Card.tsx` + `Header/Title/Description/Body/Footer` | M2, M3, etc. — sans semibold title (post-M2 typography polish) |
| **Badge** | `Badge.tsx` | Status indicators — 7 tones (neutral, brand, gold, success, warning, danger, info) × subtle / solid |
| **Drawer** | `Drawer.tsx` | M2 outlet form, M4 menu item + PDF upload — right-side spring slide, overlay blur, ESC + click-outside, body scroll lock |
| **EmptyState** | `EmptyState.tsx` | M2 outlets, M4 menu, M6 situations — dashed card with gradient icon tile + CTA slot |
| **TimePicker** | `TimePicker.tsx` | M3 operating timings — **portal-rendered** popover (escapes ancestor `overflow: hidden`); flips above when no room below; preset quick-times grid + stepper editor + AM/PM sliding toggle |
| **PhraseList** | `PhraseList.tsx` | M5, M6, M7 — editable list of phrases with three visual tones: do (green) / avoid (red) / quote (gold) |

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
| `useSop()` | `mock/sop.ts` | `ss_mock_sop` | `{ state, updateStep }` for the 10 SOP steps |
| `useCommunication()` | `mock/communication.ts` | `ss_mock_communication` | `{ data, updateAspect, upsertSituation, removeSituation }` |
| `useExcellence()` | `mock/excellence.ts` | `ss_mock_excellence` | `{ data, updatePrinciple, updateArea }` |
| `useSalesGoals()` | `mock/goals.ts` | `ss_mock_sales_goals` | `{ goals, upsert, remove, toggleEnabled, stats }` |
| `useStaff()` | `mock/staff.ts` | `ss_mock_staff` | `{ staff, upsert, remove, toggleStatus, resendInvite, stats }` |
| `useLessons()` | `mock/coaching.ts` | `ss_mock_lessons` | `{ lessons, upsert, remove, toggleActive, stats }` |
| `useDashboardMetrics(period)` | `mock/dashboard.ts` | (computed) | Period-scoped ROI / KPIs / category revenue / top items / service errors |
| `useAllStaffPerformance()` / `useStaffSessions(id)` / `useSession(id)` | `mock/performance.ts` | `ss_mock_performance` | Aggregated KPIs + per-session data with deterministic baselines per staff |

Seed data is realistic (Lumière Bistro brand, two outlets, full menu, full SOP scripts, six difficult-situation playbook scenarios, 8 sales campaigns, 10 staff across both outlets with mixed roles + invite states, 7 KPI-mapped video lessons with per-staff assignment + completion %, and ~60 generated sessions with profile-tied KPI baselines) so every page reads as a populated working state out of the box.

---

## 15. Build Log

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
Full SOW retained at `SOW.pdf` in the project root (27 pages, Business Requirements Specifications v1.1).
