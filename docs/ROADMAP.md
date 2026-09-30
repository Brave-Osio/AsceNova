# AsceNova → Production SaaS: Gap Analysis & Phased Roadmap

> Generated and maintained with Claude Code during the production-upgrade effort. It's checked in so the team can see what's been analyzed, what's shipped, and what's next without digging through chat history. Update the relevant phase's "Status" section as work lands, and append new phases below as they're planned in detail.

## Context

The team supplied a large "Principal Architect" brief asking to upgrade AsceNova (a BSCS capstone — AI-powered gamified fitness tracker) into a production-ready SaaS platform, with an explicit tech stack, a full data model, and ~15 feature domains (auth, profile, workout generator, nutrition, AI coach, gamification, dashboard, admin panel, analytics, notifications, settings, UI/UX). The brief's own instructions require analyzing the existing repo and producing a plan **before writing any code**, preserving existing architecture and never rewriting from scratch.

This document is that analysis. It has two parts: (1) a section-by-section comparison of the brief against what actually exists in the repo, and (2) a phased roadmap for closing the gaps. Each phase gets its own detailed plan and explicit approval before code is written, especially anything touching auth/permissions or the database schema.

### Headline finding

The brief assumes a greenfield localStorage-based prototype. That was **out of date** even before this effort started — the repo had already been migrated to Postgres + Prisma + JWT auth with real backend services for auth, profile, workout/nutrition generation, and gamification. The Prisma schema (`server/prisma/schema.prisma`, 26 models) **already anticipates essentially every model the brief asks for** (Notification, Goal, ChatMessage, AdminAnalyticsSnapshot, Report, SystemSetting, MealSuggestion, WorkoutExercise, StreakHistory, LeaderboardEntry, etc.) — they just weren't wired to any service/route/UI yet. So this is overwhelmingly a **wiring/implementation gap**, not a schema or architecture gap. That matters a lot for scope and risk.

## Scorecard: brief section → current status

| Brief section | Status | Notes |
|---|---|---|
| Tech stack | ✅ Mostly matches | React 19/Vite/TS/Tailwind v4/Framer Motion/RHF/Zod/TanStack Query/React Router/Recharts/react-hot-toast all present. Express/TS/Prisma/Postgres/bcrypt/JWT present. Zod v4 (client) vs v3 (server) — version mismatch, not itself a bug but worth aligning. |
| Database (remove localStorage → Postgres/Prisma) | ✅ Done | Zero live `localStorage` calls anywhere in `src/`. Fully on Prisma/Postgres (Supabase), one migration, seed script exists. All 26 requested-ish models already exist in schema. |
| Authentication | ✅ Mostly done | Register/login/logout/refresh/forgot-password/reset-password/change-password all implemented, JWT access + rotating opaque refresh tokens (httpOnly cookie), bcrypt hashing, `requireAuth`/`requireRole('ADMIN')` middleware, rate limiting on register/login/forgot-password (Phase 7). **Gaps:** password-reset emails aren't actually sent (dev-only token echo — Phase 7 explicitly deferred this, needs a third-party email provider decision); no email verification flow though `emailVerifiedAt` field exists. |
| User profile / onboarding | ✅ Done | `ProfileSetupForm` collects identity, body/goals, training, and schedule and persists to `Profile` via a real API. Food-preference/allergy fields were deliberately removed (see "Nutrition planner" below) — onboarding has no diet section. |
| Workout generator | ✅ Implemented (Phase 2 done) | `planService` calls Gemini to populate real `WorkoutExercise` rows (sets/reps/rest/tempo/target muscles/difficulty/equipment) plus per-day warm-up/cooldown/coaching tips/progression advice, with a rule-based fallback if Gemini is unavailable. See "Phase 2" below. |
| Nutrition planner | 🟡 Narrowed — calories/macros only | The PM cut the nutrition-planner *feature* (meal suggestions, food-preference collection) from scope, but confirmed the calorie/macro/water targets on the Plan page should stay. Current state: `NutritionPlan` (lean — calories/protein/carbs/fat/sodium/water only) generated per plan and shown in `NutritionPanel`; `MealSuggestion`/`Meal`/`MealLog` and `Profile.foodPreference`/`foodAllergies`/`medicalRestrictions` are removed for good. See "Phase 3" below for the full iteration history. |
| AI Fitness Coach | ✅ Implemented (Phase 1 done) | Real Gemini-backed chat: `server/src/lib/gemini.ts`, `coachContextService.ts`, `chatService.ts`, `/api/chat` routes; frontend `coachService.ts`/`useCoachChat.ts` rewritten to hit the real API; `/coach` gated behind `ProtectedRoute`. See "Phase 1" below. |
| Gamification | ✅ Mostly done (Phase 8 slice done) | XP, 9-tier ranks (Iron→Radiant), streaks, 15 achievement rules (6 added in Phase 8), an equippable title derived from your best achievement, level-up/achievement confetti, live leaderboard — all real, backend-computed, Prisma-backed. **Gaps:** `StreakHistory` and `LeaderboardEntry` models are defined but unused (leaderboard is computed live instead of precomputed — a legitimate design choice, not necessarily a bug); no daily/weekly/monthly "missions," no season resets — both need new Prisma models, deferred to a future phase with its own migration sign-off. |
| User dashboard | ✅ Implemented (Phase 5 done) | Now shows next workout, today's nutrition targets + habit-goal badges, a 28-day workout calendar strip, a weekly summary, and an AI-coach teaser (last message), alongside the existing rank/XP/streak/weight/achievements cards. All frontend-only, reusing existing endpoints — no new backend/migration. See "Phase 5" below. |
| Admin panel | ✅ Implemented (Phase 6 done) | `requireRole('ADMIN')` now gates real `/api/admin/*` routes; `AdminRoute` gates a real `/admin` UI (user table with search/filter/pagination, user detail view, suspend/reactivate/soft-delete, CSV export). "Admin" nav link shown only to admins. See "Phase 6" below. |
| Analytics | ✅ Implemented (Phase 6 done) | Live-computed stats (user counts, signups, avg XP/streak, workout-completion rate, goal distribution) via Prisma aggregates — `AdminAnalyticsSnapshot` stays intentionally unused (no scheduler/cron in this codebase, same reasoning as `LeaderboardEntry`). See "Phase 6" below. |
| Notifications | ✅ Implemented (Phase 4 done) | Achievement unlocks and rank-ups now persist as `Notification` rows (in addition to the existing inline `apply-log` response fields, unchanged). Notification bell in the navbar with unread badge, dropdown, mark-read/mark-all-read. Reminders and admin/system notification types are out of scope (no scheduler/admin panel yet). See "Phase 4" below. |
| Settings | ✅ Implemented (Phase 7 done) | `/settings` shows account info, an edit-profile section (reuses the onboarding form/endpoint, no redirect), and change-password-while-logged-in. Theme/notification-prefs deferred — see "Phase 7" below. |
| UI/UX redesign | 🟡 Partial | Already dark-themed with glassmorphism (`.glass`/`.glass-strong`), purple/violet accents, Framer Motion animations, custom Tailwind v4 theme tokens — closer to the brief's aesthetic goal than a typical capstone UI. Hand-rolled component primitives (no shadcn/Radix). No light mode (not requested elsewhere). No loading skeletons/empty-state system audited yet at the per-page level. |
| Code quality | ✅ Implemented (Phase 14 done) | Feature-sliced architecture, typed services, Zod validation, React Query caching. CI pipeline now runs build/lint/test across all three packages on every PR; backend, frontend, and mobile all lint with 0 errors; Zod aligned to v4 across frontend and backend; unused schema models (`StreakHistory`/`LeaderboardEntry`/`AdminAnalyticsSnapshot`/`Report`/`SystemSetting`) documented in-schema as a deliberate decision, not an oversight. See "Phase 14" below. |

## Technical debt / risks noted

1. ~~**No CI**~~ — fixed in Phase 14: `.github/workflows/ci.yml` runs build/lint/test (frontend, backend) and typecheck/lint (mobile) on every PR and push to `main`.
2. ~~**Zod version split**~~ — fixed in Phase 14: backend upgraded from v3 to v4, matching the frontend.
3. **Password reset has no real email delivery** — currently dev-only token echo; needs a transactional email provider before this is production-safe. Still open, explicitly deferred (see Phase 7).

## Org-policy flags for later phases

The following categories of work need **explicit, separate sign-off before implementation**, not something to do silently as part of "just wiring things up":
- **Auth/permission changes** — wiring `requireRole` into real admin routes, adding account-suspend/role-change endpoints, adding email verification.
- **Schema migrations** — good news: based on the audit above, **none of the identified work requires a new Prisma migration** (every needed table/column already exists). If a genuine schema change turns out to be necessary later, it should be flagged explicitly rather than run silently.

## Proposed phased roadmap (sequencing only — each phase gets its own detailed plan before coding)

1. **Phase 1 — AI Coach (Gemini) + real chat backend.** ✅ Done. Highest-impact, most-visible gap. Gemini SDK server-side, a `chat` service/controller/route backed by `ChatMessage`, fed real user context (profile, active plan, recent logs, XP/rank/streak), mocked `coachService.askCoach` replaced, `/coach` gated behind auth.
2. **Phase 2 — Workout generator depth.** ✅ Done. `planService` populates `WorkoutExercise` rows (sets/reps/rest/tempo/target muscles/difficulty), warm-up/cooldown/coaching tips/progression advice on `WorkoutDay`, via Gemini with a rule-based fallback. `WorkoutTable` UI renders exercise-level detail.
3. **Phase 3 — Nutrition scope narrowed.** ✅ Done. The nutrition-planner *feature* (meal suggestions, food-preference collection) was cut per the PM, but calorie/macro/water targets stay. See "Phase 3" below for the full iteration history and final state.
4. **Phase 4 — Notifications.** ✅ Done. Achievement/rank-up events now persist as `Notification` rows; notification bell UI added to the navbar. See "Phase 4" below.
5. **Phase 5 — Dashboard expansion.** ✅ Done. Five new cards added, all frontend-only. See "Phase 5" below.
6. **Phase 6 — Admin panel + analytics.** ✅ Done. `requireRole`/`AdminRoute` wired into real admin routes/pages; live-computed analytics; user management (view/suspend/reactivate/soft-delete) with CSV export. See "Phase 6" below.
7. **Phase 7 — Settings + auth hardening.** ✅ Done. Settings page (edit profile + account info + change password), rate limiting on register/login/forgot-password. Real email delivery, email verification, theme toggle, and notification preferences explicitly deferred — see "Phase 7" below for why.
8. **Phase 8 — Gamification expansion.** ✅ Done (schema-free slice — more achievements, an equippable title, level-up confetti). Missions and Season resets deferred — see "Phase 8" below.

### New phases (added after a thesis-requirements audit — separate from the original SaaS-upgrade brief above)

Everything previously deferred (real email delivery, email verification, theme toggle, notification preferences, Missions/Season resets) **stays deferred**, per explicit instruction — not part of this batch.

9. **Phase 9 — Challenges (gamification).** ✅ Done. Includes peer/social challenges (invite a friend) — see "Phase 9" below.
10. **Phase 10 — Mobile app (React Native / Expo).** 🟡 Feature-complete pending a fresh device pass — all 7 tabs (Dashboard, Plan, Log, Leaderboard, Challenges, Coach, Settings) plus Profile Setup now have real content, all backend integrations live-verified. Real installable app (not a responsive web view), full end-user feature parity with the web app; admin stays web-only. See "Phase 10" below — by far the largest phase in this roadmap.
11. **Phase 11 — Admin achievement management.** ✅ Done. Scoped to achievement metadata (title/description/icon/XP/active-toggle) only — see "Phase 11" below.
12. **Phase 12 — Goal CRUD.** ✅ Done. Wires up the already-existing-but-unused `Goal` model — see "Phase 12" below.
13. **Phase 13 — Activity-aware recommendations.** ✅ Done. Feeds real logged adherence/progress into the workout-generation prompt — see "Phase 13" below.
14. **Phase 14 — Code quality / hygiene (moved to last, per instruction).** ✅ Done. CI pipeline (3 packages), Zod version reconciliation, backend + mobile ESLint config fixes, documented decision on unused schema models, all three packages lint with 0 errors. See "Phase 14" below.

Each phase lands as its own PR/set of PRs, preserving all currently-working features, with `npm run build`/`test` green on both the frontend and `server/` before merging.

---

# Phase 1 (detailed): Real AI Fitness Coach via Gemini

## Why / what this replaces

`src/services/coachService.ts` was a single function, `askCoach(question: string): Promise<string>`, that lowercased the input and keyword-matched against ~20 canned strings (explicitly commented as "for this demo"). The chat UI (`ChatWindow`/`MessageBubble`/`useCoachChat`) was fully built and only talked to that one function. The `ChatMessage` Prisma model (with `role`, `message`, `contextSnapshot Json?`, `promptVersion String?`) already existed but nothing wrote to it, and `queryKeys.coach.history(userId)` was already reserved in the frontend's query-key registry, unused. `GEMINI_API_KEY` was already declared in `server/src/config/env.ts` (optional, unused). The `/coach` route was **ungated** (sat outside `ProtectedRoute`) per an explicit code comment saying it stays that way "until its own domain migrates" — this phase is that migration.

This phase replaces the mock with a real Gemini-backed chat endpoint that knows the user's profile, active workout/nutrition plan, recent progress, gamification state, and active goal — and persists every turn to `ChatMessage`.

## Backend (`server/src`)

**New dependency:** `@google/genai` (official Google GenAI SDK) added to `server/package.json`.

**`src/config/env.ts`** — `GEMINI_MODEL: z.string().default('gemini-2.5-flash')` alongside the existing `GEMINI_API_KEY: z.string().optional()`. No Prisma/DB change.

**`src/lib/gemini.ts`** (new) — thin wrapper around the SDK: `getClient()` constructs the client from `env.GEMINI_API_KEY` (throwing `HttpError(503, 'AI features are not configured')` if the key is missing — no silent fallback to keyword-matching), and `generateCoachReply(systemPrompt, history, userMessage)` returns the model's text response.

**`src/services/coachContextService.ts`** (new) — `getUserContext(userId)`: gathers everything the coach needs to answer personally, following the existing aggregation patterns (`leaderboardService.ts`'s parent-with-nested-`include`, `progressService.ts`'s `Promise.all` for independent reads):
- `prisma.user.findUnique` with nested `include` for `profile`, `userProgress`, and the active `workoutPlans` (including `workoutDays` + `nutritionPlan`).
- `Promise.all` for: last 7 `dailyProgress` rows, today's `waterLog` rows (summed), unlocked `achievementProgress` (joined to `Achievement`), and active `goals`.
- Returns a plain structured object — formatted into the Gemini system prompt as compact text, and stored verbatim as `ChatMessage.contextSnapshot` on the assistant's reply.

**`src/services/chatService.ts`** (new) — `getHistory(userId, limit)`; `sendMessage(userId, message)`: persists the user's message, gathers context, builds a system prompt + last ~10 turns of history, calls `generateCoachReply`, persists the assistant reply with `contextSnapshot`/`promptVersion`. On Gemini failure: `HttpError(502, ...)` — the user's message is already persisted, so nothing is lost.

**`src/validators/chat.validators.ts`**, **`src/controllers/chat.controller.ts`**, **`src/routes/chat.routes.ts`** — standard validator/controller/route trio matching existing conventions (e.g. `progress.controller.ts`). Mounted at `/api/chat` in `app.ts`.

No Prisma migration needed — `ChatMessage`/`ChatRole`/`Goal`/`Achievement` etc. all already existed in `schema.prisma`. No auth/RBAC change — uses the existing `requireAuth` middleware like every other user-scoped route.

## Frontend (`src`)

**`src/services/coachService.ts`** — replaced the mock with `getChatHistory()`/`sendCoachMessage()` through the existing `httpClient`.

**`src/features/coach-chat/hooks/useCoachChat.ts`** — rewritten to be backend-driven while keeping its exact external return shape (`{ messages, isThinking, sendMessage }`), so `ChatWindow`/`CoachChatPage` needed no changes. Uses `useQuery` for history, optimistic-append for sending (mirroring `useDailyLog`'s manual-async pattern), `showErrorToast` on failure (no fake fallback reply).

**`src/app/routes.tsx`** — `/coach` moved inside the `ProtectedRoute` children.

**`src/services/coachService.test.ts`** — rewritten to mock `httpClient` and verify request/response mapping.

No changes needed to `ChatWindow.tsx`, `MessageBubble.tsx`, `CoachChatPage.tsx`, or `src/features/coach-chat/types.ts` — the UI contract was preserved.

## Status: implemented and verified end-to-end

All backend and frontend files above were written as planned. Build/lint/test clean on both packages. **Manually verified live** against real Supabase + Gemini: registered a user, created a profile, generated a plan, sent a real message to `/api/chat` — Gemini's reply correctly cited the user's actual workout split and macro targets, persisted correctly to `ChatMessage`, history loads in order, unauthenticated requests get 401.

---

# Phase 2 (detailed): Workout generator depth

## Why / what this adds

`server/src/services/planService.ts`'s `buildWorkoutSplit` only produced day/focus labels ("Push Day", "Rest") — no actual exercises. The `WorkoutExercise` model and `WorkoutDay.workoutName/warmUp/coolDown/estimatedDurationMinutes/estimatedCaloriesBurned/coachingTips/progressionAdvice` fields already existed in the schema but nothing had ever populated them. `WorkoutTable.tsx` only rendered a flat list of day/focus pills.

## Design decision

`buildWorkoutSplit` and `buildNutritionTargets` stay **exactly as-is** — deterministic, well-tested (`planService.test.ts`, 8 tests), cheap. This phase adds a **new** Gemini call that takes the day/focus skeleton and profile and fills in exercise-level detail. Nutrition depth (BMI/BMR/TDEE, meal suggestions) is out of scope — that's Phase 3.

**Fallback behavior:** if `GEMINI_API_KEY` is unset or the Gemini call/validation fails for any reason, generation falls back to the existing rule-based skeleton (no exercises, `source: 'RULE_BASED_LEGACY'`) rather than failing the request — a real, already-tested algorithm, not a fake stand-in. When Gemini succeeds, `source: 'GEMINI'` and the plan carries full exercise detail. Old plans in the DB (no exercises) keep rendering exactly as before with zero migration needed.

## Backend (`server/src`)

**`src/lib/gemini.ts`** — added `generateStructuredContent<T>(prompt, responseSchema)`, reusing the same client, using Gemini's JSON mode (`responseMimeType: 'application/json'`).

**`src/services/workoutGenerationService.ts`** (new) — a Zod schema (`workoutDetailResponseSchema`) validating the expected 7-day JSON shape (workout name/warm-up/cooldown/duration/calories/coaching tips/progression advice, each with an `exercises[]` array of name/sets/reps/rest/tempo/target muscles/difficulty/equipment/notes) — validated **in addition to** the Gemini `responseSchema` (defense in depth, never trust raw LLM JSON); a matching Gemini `responseSchema` built with the SDK's `Type` enum; and `generateExerciseDetail(profile, skeleton, priorExerciseNames)`, which builds a prompt embedding the profile and the fixed day/focus skeleton (so Gemini only fills in detail, doesn't invent its own schedule), plus a "don't repeat these previous exercises" list for variety.

**`src/services/planService.ts`** — `generateAndSaveActivePlan` now fetches the previous plan's exercise names for variety context, tries `generateExerciseDetail`, and on success sets `source: 'GEMINI'` with full nested `exercises` creates; on any failure, logs it and falls back to the rule-based skeleton (request still succeeds).

No route/controller/validator changes needed — `POST /api/plans` already accepted `{ splitStyle }`; the response shape just got richer.

**`server/src/services/workoutGenerationService.test.ts`** (new) — unit tests for the Zod validation schema against valid and malformed sample JSON.

## Frontend (`src`)

**`src/types/plan.types.ts`** — extended `WorkoutDay` with optional exercise-detail fields and a new `WorkoutExercise` interface. All optional/backward compatible.

**`src/services/planService.ts`** — extended the API mapping to pass the new fields through.

**`src/features/fitness-plan/components/WorkoutTable.tsx`** — added expand/collapse per day: the pill row becomes a clickable header (only when exercises exist), expanding to reveal warm-up, exercises, cooldown, coaching tips, and progression advice. Days with no exercise data (rule-based fallback, or pre-existing plans) render exactly as before.

## Status: implemented and verified end-to-end

Code complete, all automated checks clean (server: build + 28/28 tests; frontend: build + 21/21 tests). **Manually verified live**: real Gemini-generated exercises render correctly in the expandable `WorkoutTable` UI against the real Supabase + Gemini setup.

**Side fixes made during this phase** (pre-existing bugs, surfaced because this phase gave `planService.ts` its first transitive dependency on `lib/gemini.ts` → `config/env.ts`):
- `server/tsconfig.json` now excludes `*.test.ts` from the build (it was compiling tests into `dist/`, causing Vitest to run every backend test twice).
- Added `server/vitest.config.ts` (loads `.env` via `dotenv/config`) so backend tests don't depend on bubbling up to the frontend's Vite config.
- Root `vite.config.ts` now scopes `test.include` to `src/**` — it was previously also picking up and running `server/`'s tests.

---

# Phase 3: Nutrition scope narrowed (not fully removed)

The PM omitted the nutrition-planner *feature* (meal suggestions, food-preference collection) from project scope, but the basic calorie/macro/water targets on the Plan page were confirmed as still wanted. This went through a few iterations — documented here so the history is clear, with the **final state** summarized last.

**Iteration 1 — removed everything nutrition-related**, including a real migration dropping `NutritionPlan`, `MealSuggestion`, `Meal`, `MealLog`, `MealType`, `MealCategory`.

**Iteration 2 — also removed `Profile.foodPreference`/`foodAllergies`/`medicalRestrictions`** and the `FoodPreference` enum (a second migration), deleting the "Diet & Restrictions" onboarding section entirely.

**Iteration 3 (final) — calories/macros/water restored**, everything else stays removed. A third migration re-added a **leaner** `NutritionPlan` model — only `calories`/`proteinGrams`/`carbsGrams`/`fatGrams`/`sodiumMg`/`waterLiters` (no BMI/BMR/TDEE/fiber/sugar/meal-timing/micronutrient fields — those were never part of the original brief's ask here, just unused placeholders, so they weren't brought back). `buildNutritionTargets` (deterministic Mifflin-St-Jeor-ish formula) is back in `planService.ts`, `NutritionPanel.tsx` and the "Nutrition Targets" section on `/plan` are back, and the AI coach knows the user's daily nutrition targets again.

**Current (final) state:**
- ✅ **Kept**: calorie/protein/carb/fat/sodium/water targets, generated per plan, shown on `/plan`, known to the AI coach.
- ❌ **Removed for good**: `MealSuggestion`/`Meal`/`MealLog` (meal suggestions feature — never built, and not coming back), `Profile.foodPreference`/`foodAllergies`/`medicalRestrictions` (no food-preference/allergy data collected anywhere, including onboarding).
- The AI coach can still discuss nutrition conversationally in general (chat topic chip, welcome message) — that was never tied to any of the removed/restored models either way.

Verified after the final iteration: backend build clean, 28/28 tests; frontend build clean, 21/21 tests.

A couple of bugs surfaced during manual testing after this, both fixed: (1) plans generated while `NutritionPlan` was briefly out of the schema had no nutrition row — `getActivePlan` now self-heals by backfilling one on the fly instead of crashing; (2) the AI coach's Markdown-formatted replies (bold, bullet lists) were rendering as raw text in the chat UI — added `react-markdown` with theme-matched styling, applied only to coach messages.

---

# Phase 4: Notifications

`Notification`/`NotificationType` already existed in the schema but nothing created or read them — achievement unlocks and rank-ups only ever surfaced as one-shot fields in `apply-log`'s response, with no persisted history.

**What shipped:**
- `server/src/services/notificationService.ts` — CRUD-ish helpers (`createNotification` is transaction-scoped so it can fire atomically alongside whatever triggered it; `getRecent`, `getUnreadCount`, `markAsRead`, `markAllAsRead`).
- `progressService.applyDailyLog` now creates a `RANK_UP` notification on rank change and an `ACHIEVEMENT` notification per newly-unlocked achievement, inside its existing transaction. **Additive only** — the inline `xpGained`/`newAchievementTitles` response is unchanged, so the existing Daily Log celebration UX still works.
- `GET/PATCH/POST /api/notifications*` routes (list, unread-count, mark-one-read, mark-all-read), all `requireAuth`-gated.
- Frontend: a self-contained `NotificationBell` component (checks its own auth state, renders nothing when logged out) in the navbar — unread badge, dropdown list, click-to-mark-read, mark-all-read. `useDailyLog` invalidates the notification queries after a successful log submission so the bell updates immediately.

**Out of scope:** reminders (`REMINDER` type) — needs a scheduler/cron, real infra work, not just wiring; `SYSTEM`/`ADMIN`/`PLAN_READY` types — no sender for them yet (no admin panel, plan generation is synchronous).

**Verified live** against the real Supabase DB: triggered the `first_workout` achievement via a real daily-log submission, confirmed the matching notification was persisted with correct title/body/metadata, confirmed unread-count tracked correctly, confirmed mark-as-read works and 404s on an invalid id, confirmed unauthenticated requests get 401. Backend build clean (28/28 tests unaffected — no new tests added, since the only new logic is thin Prisma wrappers + string templates, no new pure functions to unit-test). Frontend build clean, 21/21 tests, lint shows only the same 3 pre-existing unrelated errors.

A follow-up bug was found and fixed after this shipped: the "Simulate 45 Days Progress" dev tool replays real days through `applyDailyLog` (so it *was* creating notifications correctly server-side) but never invalidated the notification query caches on completion, so the bell silently stayed stale after using it. Fixed by adding the same cache invalidation `useDailyLog.ts` already had.

---

# Phase 5: Dashboard expansion

Five new cards added to `/dashboard`, all **frontend-only** — zero new backend routes, services, or migrations. Everything needed already existed behind existing endpoints (active plan, daily-log history, chat history).

**What shipped:**
- `NextWorkoutCard` — maps today's weekday to the matching day in the active plan (skips ahead past rest days).
- `TodayTargetsCard` — the active plan's calorie/protein/carb/fat/water targets, plus today's water/protein goal-hit badges if today's already logged.
- `WeeklySummaryCard` — days logged, workouts completed, goal hit-rates, and weight change over the last 7 days.
- `WorkoutCalendarCard` — a compact 28-day grid (GitHub-contribution-strip style) showing logged days and which ones included a completed workout.
- `CoachTeaserCard` — shows the most recent AI Coach message (reusing the same query-cache key `/coach` uses) with a "Continue chatting" link — deliberately **not** a new Gemini call on every dashboard load, to avoid ongoing API cost/latency for a page that loads far more often than the coach is actually used.

**Two honesty constraints that shaped this:** there's no calorie/macro *consumption* logging anywhere in the app (out of scope per the Phase 3 nutrition decision), so "today's targets" means the plan's targets, not "consumed vs. target." Similarly, `WaterLog`/`WorkoutLog` are schema-only models nothing ever writes to — the calendar reflects `DailyProgress` history (which is real and populated), not those unused tables.

**Verified:** frontend build clean, lint unchanged (same 3 pre-existing errors), 21/21 tests. Spot-checked the real active plan's data directly against the database to confirm weekday-label matching and rest-day detection work exactly as the components assume.

A follow-up fix landed after this shipped: `CoachTeaserCard` showed the coach's last message as raw Markdown (literal `**`/`*` characters), same root cause as the Phase 1 chat-window issue. Since this is a `line-clamp`-truncated preview (not the full chat), block-level Markdown rendering doesn't clamp cleanly, so this strips the syntax down to flowing plain text instead of rendering it with `react-markdown` like the chat window does.

---

# Phase 8: Gamification expansion (schema-free slice)

The roadmap's Phase 8 bundles four things: missions, badges/titles, season resets, and level-up animation polish. Missions and Season resets both need brand-new Prisma models (nothing like a recurring-mission or season-boundary concept existed in the schema) — deferred to a future phase with its own migration sign-off. This phase ships the two pieces that need **zero schema migration**.

**What shipped:**
- **6 new achievements** (9 → 15 total), reusing the existing `Achievement`/`AchievementProgress` tables: `hydration_hero` (14 water-goal days), `protein_pro` (14 protein-goal days), `twenty_workouts` (20 completed workouts), `goal_crusher` (reached your goal weight — direction-aware for `WEIGHT_LOSS`/`MUSCLE_GAIN`), `ask_the_coach` (sent your first AI Coach message), `platinum_promotion` (reached Platinum rank).
- **An equippable title** — a badge next to your name on the Dashboard, derived from the highest-priority achievement you've unlocked (`src/constants/titles.ts`, e.g. `discipline_champion` → "The Disciplined"). Purely frontend, computed from data already available client-side — no new query.
- **Level-up/achievement confetti** — added `canvas-confetti` (small, ~5KB gzipped). Fires once when a real daily-log submission or a full "Simulate Progress" run results in a rank-up or a new achievement — not per simulated day.

**Verified live** against Supabase: seeded the 6 new achievements into the DB (confirmed 15 total). Registered a test user with a `WEIGHT_LOSS` goal and a goal weight, logged today's weight at/below that goal plus a real AI Coach message, then called `apply-log` — both `goal_crusher` and `ask_the_coach` unlocked correctly (the two rules unit tests can't cover, since they need real `Profile`/`ChatMessage` data). Backend build clean, 34/34 tests (28 + 6 new). Frontend build clean, lint unchanged, 21/21 tests.

**Not independently exercised live:** the 14–20-day-threshold achievements (impractical to grind out manually — covered by unit tests instead) and the confetti animation itself (needs a browser to see).

---

# Phase 7: Settings + auth hardening

The original roadmap line for Phase 7 also listed real password-reset email delivery, email verification, a theme toggle, and notification preferences. Scoped down to the three pieces below — the rest each pull in something bigger than "add a settings page": real email needs a paid third-party provider decision, email verification needs that plus a new schema table, a theme toggle means auditing ~39 files of hardcoded dark-mode Tailwind classes with zero existing theming infrastructure, and notification preferences would need a schema change to control channels (there's only the in-app bell today) that don't otherwise exist.

**What shipped:**
- **Settings page** (`/settings`) — account info panel (email/role/status/joined date, from the existing `/api/auth/me`-populated `AuthContext`), an edit-profile section, and a change-password form.
- **Profile editing reused, not rebuilt** — `PUT /api/profile` was already an upsert, not create-only. `useProfileForm`/`ProfileSetupForm` got two small optional additions (a `redirect` option, a `submitLabel` prop) so the exact same onboarding form/schema/endpoint works in Settings without duplicating ~140 lines of form fields, and the onboarding call site needed zero changes.
- **Change password while logged in** — new `POST /api/auth/change-password` (verifies current password via the existing `comparePassword`, then revokes all active refresh tokens exactly like the token-based reset flow already does — forces re-login everywhere, same security posture).
- **Rate limiting** — `express-rate-limit` on `/register`, `/login`, `/forgot-password` (20 requests/15min per IP, shared limiter). Also added `app.set('trust proxy', 1)` in `app.ts`, required for correct per-IP limiting behind Vercel's proxy (was missing entirely before this).

**Verified live** against the real Supabase DB: change-password rejects a wrong current password (401) and succeeds with the right one; old password then fails login, new one works; refresh-token revocation confirmed with a real cookie (a token captured before the change fails after it); rate limiting confirmed by hammering `/login` past the shared budget and getting clean `429`s. Backend build clean, 34/34 tests. Frontend build clean, lint unchanged, 21/21 tests.

**Not independently exercised in-browser:** the `/settings` page UI itself — needs the user's own visual confirmation, same as every phase's frontend work.

---

# Phase 6: Admin panel + analytics

`requireRole` (backend RBAC middleware) and `AdminRoute` (frontend guard) both existed but were wired into zero routes. `authService.login()` already rejected non-`ACTIVE` accounts with a 403 — suspension enforcement was pre-existing; this phase only needed an endpoint to *set* `SUSPENDED`. Scope was narrowed up front: user management is **suspend + soft-delete only** (no role promotion/demotion — declined as too sensitive), export is **CSV only** (no new .xlsx dependency). Zero Prisma migration required — every field this phase touches already existed on the schema.

**Analytics design decision:** stats are computed **live** via Prisma aggregate queries rather than populating the unused `AdminAnalyticsSnapshot` model — this codebase has no scheduler/cron (Vercel serverless deploy target), so nothing would ever refresh a snapshot table. Same reasoning already applied to why `LeaderboardEntry`/`StreakHistory` stay unused.

**What shipped:**
- `server/src/services/adminService.ts` — `getStats()` (user counts by status, 7d/30d signups, avg XP/streak, workout-completion rate, goal distribution, all via `Promise.all`), `listUsers()` (search + status filter + pagination), `getUserDetail()`, `suspendUser`/`reactivateUser` (toggle `AccountStatus`), `softDeleteUser` (an `update` setting `deleted: true`/`deletedAt`/`status: 'DELETED'` — never `prisma.user.delete()`), `exportUsersCsv()` (manual CSV string, zero new dependency). All mutating actions guard against an admin acting on their own account.
- `/api/admin/*` routes, all behind `requireAuth` + `requireRole('ADMIN')`.
- Frontend: `/admin` (stat cards + user table) and `/admin/users/:userId` (detail view), both behind `AdminRoute`; an "Admin" nav link shown only when `useAuth().isAdmin`; suspend/delete actions confirm via `window.confirm()` (no modal component exists yet in this codebase, so this was the pragmatic choice over building one for a single feature).

**Bug found and fixed during verification:** the initial Prisma `include` queries for `User` didn't exclude `passwordHash`, so the bcrypt hash was leaking in admin API responses. Fixed with `omit: { passwordHash: true }` on every `User` query in `adminService.ts`.

**Verified live** against the real Supabase DB: promoted a test account to `Role.ADMIN` directly via Prisma (no role-change endpoint exists, by design), confirmed stats/list/search/filter/detail all return real data with no `passwordHash` leak, confirmed suspend → blocked login (existing 403) → reactivate → login works again, confirmed the self-suspend guard (400), confirmed soft-delete sets `deleted`/`deletedAt` without removing the row and excludes it from the list, confirmed 401 unauthenticated / 403 non-admin, confirmed CSV export returns correct headers and rows. Backend build clean, 34/34 tests unaffected. Frontend build clean, lint unchanged (same 3 pre-existing errors), 21/21 tests unaffected.

**Not independently exercised in-browser:** the "Admin" nav link's conditional visibility and the CSV download's client-side blob trigger — covered by direct API verification and code review; needs visual confirmation in-browser.

Out of scope, explicitly: role promotion/demotion, Excel/.xlsx export, charts/graphs for analytics (stat cards + a distribution list cover it for now), populating `AdminAnalyticsSnapshot`/`Report`/`SystemSetting`.

---

# Phase 9 (detailed): Challenges (gamification, incl. peer/social) — ✅ DONE

## Context

The thesis requirement list is "points, achievements, **challenges**, streaks, and leaderboards" — everything else in that list is real and live; Challenges is the one clean, unambiguous gap (confirmed via a thesis-compliance audit: no `Challenge` model, no route/service/UI anywhere). Scoped to include peer/social challenges (invite a friend to join the same challenge), not just system-defined solo ones — meaningfully bigger than Achievements, because a social challenge needs a real, joinable, shared entity (who's in it, who's accepted, shared progress) rather than something silently derived per-user the way achievements/streaks are.

**Schema migration required.**

## Backend (`server/`)

**`prisma/schema.prisma`** — new models/enums:
- `enum ChallengeMetric { WORKOUTS_COMPLETED, WATER_GOAL_HITS, PROTEIN_GOAL_HITS, LOG_STREAK }` — maps directly onto fields already tracked by `DailyProgress`/`UserProgress`, no new tracking needed.
- `model Challenge` — the system-defined **template** (seeded/code-defined, not admin-editable this round, per the Phase 11 scoping decision): `id, title, description, icon, metric: ChallengeMetric, targetValue: Int, periodDays: Int (7 for weekly), xpReward: Int`. ~4-5 seeded rows (e.g. "Weekly Warrior" = 4 workouts/7 days, "Hydration Squad" = 5 water-goal days/7 days, "Protein Pact" = 5 protein-goal days/7 days, "Streak Squad" = maintain streak all 7 days).
- `model ChallengeInvite` — one specific run of a challenge, created by a user: `id, challengeId, createdByUserId, periodStart, periodEnd, status: ChallengeInviteStatus (ACTIVE/EXPIRED)`.
- `model ChallengeParticipant` — one row per invitee (including the creator, auto-accepted): `id, challengeInviteId, userId, status: ChallengeParticipantStatus (INVITED/ACCEPTED/DECLINED), progressValue: Int @default(0), completedAt: DateTime?`. `@@unique([challengeInviteId, userId])`.
- Add `CHALLENGE_COMPLETE` to `XpSource`; add `CHALLENGE_INVITE`/`CHALLENGE_COMPLETED` to `NotificationType`.

**`prisma/seed.ts`** — add the ~4-5 `Challenge` template rows, same `upsert`-by-id pattern as `ACHIEVEMENTS`.

**`src/services/dailyProgressService.ts`** — add a period-scoped counter (achievements use lifetime totals; challenges need "this period only"): `countMetricSince(userId, field: 'workoutCompleted' | 'hitWaterGoal' | 'hitProteinGoal', since: Date)`.

**`src/services/challengeService.ts`** (new):
- `getCatalog()` — list active `Challenge` templates.
- `createInvite(userId, challengeId, inviteeEmails[])` — looks up each invitee by email (silently skips unknown emails — no account enumeration via error messages, same anti-enumeration posture as `forgotPassword`), creates `ChallengeInvite` (`periodStart = now`, `periodEnd = now + periodDays`), a `ChallengeParticipant` for the creator (`ACCEPTED`), and one per found invitee (`INVITED`) — fires a `CHALLENGE_INVITE` notification to each invitee via the existing `notificationService.createNotification`.
- `respondToInvite(userId, inviteId, accept: boolean)` — updates the caller's own `ChallengeParticipant` row only (`updateMany` scoped to `userId` + `challengeInviteId`, same ownership-scoping pattern as `notificationService.markAsRead`).
- `getMyChallenges(userId)` — all invites the user participates in; lazily flips `status` to `EXPIRED` on read if `periodEnd < now` (no scheduler exists in this codebase — same "compute live, no cron" reasoning already established for `AdminAnalyticsSnapshot`/leaderboard).
- Progress isn't a separate endpoint — it updates automatically.

**`src/services/progressService.ts`** — inside the existing `applyDailyLog` transaction, after computing achievements: fetch the user's `ACCEPTED` participant rows on still-`ACTIVE` invites, recompute `progressValue` via `countMetricSince` (or streak length for `LOG_STREAK`) for each, and for any that just crossed `targetValue` and aren't already `completedAt`: set `completedAt`, grant `CHALLENGE_COMPLETE` XP, fire a `CHALLENGE_COMPLETED` notification. Same transaction, same `tx` client — no new transaction.

**`src/controllers/challenge.controller.ts`** + **`src/routes/challenge.routes.ts`** — `GET /catalog`, `GET /mine`, `POST /` (create+invite), `POST /:inviteId/respond`, all `requireAuth`. Mounted at `/api/challenges`.

## Frontend (`src`)

**`src/features/challenges/`** (new slice) — types, service (`getChallengeCatalog`, `getMyChallenges`, `createChallenge`, `respondToChallengeInvite`), `useChallenges`/`useCreateChallenge`/`useRespondToChallenge` hooks (React Query, new `queryKeys.challenges.*`), components: `ChallengeCard` (participants + progress bars, accept/decline for pending invites), `CreateChallengeForm` (pick a template from the catalog + enter friend email(s)).

**`src/pages/ChallengesPage/ChallengesPage.tsx`** (new) + `ROUTES.challenges`/nav link — inside `ProtectedRoute`.

**`NotificationBell`** needs no changes — it already renders whatever `Notification` rows exist generically; the two new types just need a small icon/label mapping if one exists per-type.

## Out of scope

- Admin management of challenge templates (achievements only this round, per the Phase 11 scoping decision).
- In-app friend/contacts list — invites are by typing a friend's email directly, not a friend-graph feature.
- Push notifications for invites — uses the existing in-app bell only, same channel as everything else.

## Verification

1. `server`: migration applied, `npm run build`, `npm test`.
2. Frontend: build/lint/test.
3. Manual, live: create a challenge inviting a second real test account, confirm the invitee gets a notification, accept it, log daily progress on both accounts until the target is crossed, confirm both participants' progress updates and the completing account gets XP + a completion notification. Confirm declining an invite removes it from the invitee's "mine" list without affecting the creator's. Confirm an expired invite shows as `EXPIRED` on next read.

**What shipped:** `Challenge`/`ChallengeInvite`/`ChallengeParticipant` models (migration `20260927161918_add_challenges`), 4 seeded weekly templates (Weekly Warrior, Hydration Squad, Protein Pact, Streak Squad), full invite/accept/decline flow with email-based friend invites, progress auto-tracked inside the existing `applyDailyLog` transaction, XP + notification on completion, lazy expiry (no scheduler, matches this codebase's established "compute live" convention). `/challenges` page + nav link.

**Verified live** against the real Supabase DB: created an invite, confirmed the invitee got a real `CHALLENGE_INVITE` notification, accepted it, logged 5 days within the challenge's forward-looking window, confirmed progress tracked per-participant and completion fired exactly on crossing the target (+100 XP, `CHALLENGE_COMPLETED` notification). Confirmed a bad challenge id 404s, decline doesn't affect the creator, and the lazy-expiry flip actually persists to the DB (not just the response). Backend 34/34 tests, frontend 21/21 tests, both builds clean.

Not independently exercised in-browser: the `ChallengesPage` UI itself — needs visual confirmation.

Phase 9 is done.

---

# Phase 10 (detailed): Mobile app (React Native / Expo) — 🟡 FEATURE-COMPLETE, PENDING FRESH DEVICE PASS

## Context

By far the largest of the new phases — the thesis explicitly requires **"Mobile: React Native"** / **"React Native mobile application for end-users"**, and the codebase today is web-only (confirmed: no `react-native` anywhere, no `ios`/`android` dirs). This is a real, installable native/cross-platform app (built with **Expo**, producing an actual installable build via Expo Go or EAS Build) — explicitly **not** a responsive redesign of the existing web app, which already adapts to phone screens but would not satisfy this thesis requirement. **Full end-user feature parity** with the web app. The admin panel stays web-only — that's not a gap, it's what the thesis itself specifies ("Web Admin: React").

This is genuinely comparable in size to the rest of this roadmap combined. It's written here as one coherent phase (one roadmap entry), but should be **built incrementally** (see "Suggested build order" below) rather than attempted as one giant PR.

## The one real backend change this requires (and why)

The web app's refresh-token flow relies on an **httpOnly cookie** (`server/src/controllers/auth.controller.ts`'s `setRefreshCookie`) — this doesn't work the same way for a React Native app. RN's networking layer doesn't maintain a persistent, domain-bound cookie jar across app restarts the way a browser does, so a cookie-only refresh flow would silently break on every app relaunch.

**Fix (additive, zero web-behavior change):** `authService.login()`/`register()`/`refresh()` already return the raw refresh token internally — the controllers just need to **also** include it in the JSON response body (alongside still setting the cookie, which browsers keep using unaffected). `POST /api/auth/refresh` accepts the token from **either** the cookie (web, unchanged) **or** a `{ refreshToken }` body field (mobile) — whichever is present. The mobile app stores this token itself via `expo-secure-store` (encrypted at-rest — the correct RN equivalent of "not casually readable," matching the security intent of an httpOnly cookie as closely as the platform allows) and sends it explicitly on refresh.

This is an auth-mechanism change, flagged per policy — needs explicit sign-off before implementation, consistent with every other auth-touching phase.

## New package: `/mobile`

A **third independent package** (matches this repo's existing "independent packages, not a monorepo/workspace" philosophy — `CLAUDE.md` gets updated from "two" to "three" packages once this lands). Expo + TypeScript, its own `package.json`/lockfile/`node_modules`, run via `npx expo start` from `/mobile`.

- **Navigation**: **Expo Router** (file-based routing, built on React Navigation under the hood — the current Expo-recommended default, confirmed via the official docs and the scaffold's own bundled agent guidance) rather than bare React Navigation. `(app)/` is a bottom-tab group (Dashboard, Plan, Log, Leaderboard, Challenges, Coach, Settings — mirrors `NAV_LINKS`), `(auth)/` is a separate stack (Login/Register/ForgotPassword) shown when unauthenticated. Switching between them uses `Stack.Protected guard={isAuthenticated}` in the root `_layout.tsx` — all routes are always defined, only reachability changes with auth state (docs.expo.dev/router/advanced/authentication) — this is the actual replacement for the web's `ProtectedRoute`/profile-empty-state checks.
- **Data layer**: same TanStack Query + axios pattern as the web app — an `httpClient.ts` equivalent (axios instance, `Authorization` header interceptor, refresh-on-401 interceptor) ported directly, with the one change above (SecureStore-backed refresh token instead of a cookie). Query keys, service-call shapes, and API response mapping are duplicated into the mobile package (not shared via a monorepo package — a bigger, separate architectural change not requested), following the exact same "one service file per API domain" convention already established.
- **UI**: React Native core components with a `StyleSheet`-based theme module mirroring the web's existing dark violet/cyan tokens (can't reuse Tailwind directly in RN), so the app is visually recognizable as the same product, not restyled from scratch.
- **Storage**: access token in memory only (same posture as web); refresh token via `expo-secure-store`; zero use of plain `AsyncStorage` for anything auth-related.
- **Screens** (one per existing web page, same feature scope): Login, Register, Forgot/Reset Password, Profile Setup, Dashboard, Plan (workout + nutrition), Daily Log, Leaderboard, Coach Chat, Settings (account info, edit profile, change password), plus Challenges and Goals once Phases 9/12 exist.

## Suggested build order (within this one phase)

1. Project scaffold + theme module + navigation shell (auth stack vs. tab navigator) + the backend refresh-token change.
2. Auth flow end-to-end (login/register/logout/silent-refresh) — proves the whole plumbing works before any feature screens.
3. Profile setup + Dashboard.
4. Daily Log + Plan (the core loop).
5. Leaderboard, Coach Chat, Settings.
6. Whatever Phases 9/12 have landed by then (Challenges, Goals).

## Out of scope

- Native push notifications (the in-app bell/list pattern is reused; no APNs/FCM integration).
- Offline support / local caching beyond what TanStack Query does by default.
- App store submission/signing (EAS Build config gets set up enough to produce an installable build for demo purposes; actual store listing is out of scope).
- Any redesign of the web app to match — the web stays as-is.

## Verification

1. `npx expo start`, run in Expo Go (or a simulator/emulator) — full login→dashboard→daily-log→plan-view round trip against the real backend.
2. Force-quit and relaunch the app — confirm the silent-refresh flow using the SecureStore-persisted refresh token still logs the user back in without re-entering credentials.
3. Confirm the web app is completely unaffected — `npm run build`/`test` on both existing packages still green, log in via the browser and confirm the refresh cookie flow still works exactly as before.

## Status: feature-complete pending a fresh device pass

**What's shipped, complete:** the backend refresh-token change (returns `refreshToken` in the JSON body on login/register/refresh, accepts it from the body as a fallback to the cookie); the `/mobile` package (Expo SDK 57 + Expo Router + TypeScript); theme module mirroring the web's dark violet/cyan tokens; `httpClient.ts` (axios + SecureStore-backed refresh + auth-logout event bus); `AuthContext.tsx`; real Login/Register/Forgot-Password screens; `(auth)`/`(app)` route groups with `Stack.Protected` auth guarding; a full Profile Setup screen (reused for onboarding and editing); and now **all 7 tabs with real content**:
- **Dashboard** — profile-empty-state check, rank/XP/streak/achievement-count stat cards.
- **Plan** — nutrition targets summary, split-style picker, expandable per-day workout cards (warm-up/exercises/cooldown/coaching tips), regenerate button, auto-generates on first visit (same as web).
- **Log** — full daily-log form (weight, 5-habit checklist, notes), XP/achievement result card on submit.
- **Leaderboard** — real ranked list with the current user highlighted.
- **Challenges** — full port of Phase 9's web feature: catalog picker, friend-email invite (`TagInput`), accept/decline, per-participant progress bars.
- **Coach** — real chat against the live Gemini-backed backend, suggested-question chips, thinking indicator.
- **Settings** — account info, Edit Profile link, working Change Password, logout.

Two honest simplifications from the web (not functional gaps): no confetti animation on rank-up/achievement (`canvas-confetti` has no RN equivalent installed), and `NutritionSummary` uses flat accent colors instead of the web's gradient fills (would need `expo-linear-gradient`, a new dependency, for a visual-only difference).

**Verified:**
- Backend: build clean, 34/34 tests unaffected. Live-verified both refresh-token paths (web cookie unchanged, mobile body-token works), the full profile create/read round-trip, plan generation (real Gemini output, 7 days, exercises populated, nutrition targets), leaderboard (real ranked rows), coach chat (real Gemini reply correctly referencing the test account's actual plan), and daily-log + apply-log (XP granted, achievements unlocked) — all with the exact payload shapes the mobile services produce.
- Mobile: `npx tsc --noEmit` clean, `npx expo lint` clean (one pre-existing-pattern warning matching the web's own `AuthContext.tsx`, not new). `npx expo export --platform web` bundles cleanly (1036 modules, 0 errors) — the closest verification available in this environment to actually running the app, since there's no simulator/device here; proves the JS/routing/data-layer wiring is structurally sound but does **not** prove native rendering behavior.
- `npx expo-doctor`'s "duplicate react" flag investigated and confirmed benign (see earlier note) — expected for 3 independent packages in one repo.
- **User confirmed on a real physical device via Expo Go**: register, login, and logout work end-to-end against the live backend over LAN (caught and fixed two real setup issues along the way — editing `.env.example` instead of `.env`, and a malformed API base URL). This device confirmation predates the Profile Setup/Dashboard-enrichment/Plan/Log/Leaderboard/Challenges/Coach/Settings work above — **a fresh device pass on all of it is the one remaining verification step.**

---

# Phase 11 (detailed): Admin achievement management — ✅ DONE

## Context

Scoped to achievements only — metadata (title/description/icon/XP reward/active toggle), not a new exercise-content library (no such library exists to manage, and building one is a separable, bigger feature). Important scope clarity: `Achievement.id` is a hand-chosen string (e.g. `"first_workout"`) referenced directly by hardcoded keys in `progressService.ts`'s `ACHIEVEMENT_RULES` — the **unlock logic** stays code-defined. Admins can edit how an achievement is *presented* and *rewarded*, and turn it on/off, but can't define new unlock criteria through the UI — so this phase supports **edit + activate/deactivate on the existing 15 rows**, not free-form creation of new achievements.

No schema migration.

## Backend (`server/src`)

**`src/services/adminService.ts`** — add `listAchievements()`, `updateAchievement(id, { title?, description?, icon?, xpReward?, isActive? })`.

**`src/controllers/admin.controller.ts`** + **`src/routes/admin.routes.ts`** — `GET /api/admin/achievements`, `PATCH /api/admin/achievements/:id`, both already covered by the router-level `requireAuth`/`requireRole('ADMIN')`.

**`src/services/progressService.ts`** — `evaluateAchievements` needs one small change: skip rules for achievements where `isActive === false` — otherwise deactivating one in the admin panel wouldn't actually stop it from unlocking.

## Frontend (`src`)

**`src/features/admin/hooks/useAdminAchievements.ts`** + **`components/AchievementEditor.tsx`** (new) — a simple list/edit-in-place form (reuses `TextField`/`TextArea`/`Checkbox`/`Button`), added as a new section on `AdminDashboardPage.tsx` (or its own tab/page if that gets crowded).

## Out of scope

- Creating brand-new achievements with custom unlock logic through the UI.
- Admin management of Challenges (Phase 9).

## Verification

1. `server`: build, test (34/34 + a new test case for the `isActive` check).
2. Frontend: build/lint/test.
3. Manual, live: edit an achievement's title/icon via the admin panel, confirm it reflects immediately on `AchievementCard`. Deactivate an achievement a test account hasn't unlocked yet, trigger its condition, confirm it does **not** unlock while inactive; reactivate and confirm it unlocks going forward.

## Status: implemented and verified end-to-end

Code complete exactly per plan — zero migration. `evaluateAchievements` gained an optional third `activeIds` parameter (defaults to "no filtering" when omitted, so all 18 existing unit tests needed zero changes) — only the real `applyDailyLog` call site passes the live active-id set, fetched via one more query in the same `Promise.all` that already gathers achievement-context data. Backend build clean, 37/37 tests (34 + 3 new: backward-compat, skips an inactive rule, still unlocks an active one). Frontend build clean, lint unchanged (same 4 pre-existing errors), 21/21 tests.

**Live-verified against the real Supabase DB**: listed all 15 achievements as the seeded admin, edited one's metadata via `PATCH`, confirmed it persisted. Deactivated `first_workout` on a fresh test account that had just logged a qualifying workout — confirmed `apply-log` correctly returned `newAchievementTitles: []` (did **not** unlock) despite the condition being met. Reactivated it and re-ran `apply-log` for the same date — confirmed it now unlocked correctly (`newAchievementTitles: ["First Workout"]`, XP granted). Confirmed 401 unauthenticated on the achievements endpoints. Test account cleaned up, seed data (`first_workout`'s title/icon/active state) restored to original, dev server stopped.

Not independently exercised in-browser: the `AchievementEditor` UI itself on the admin panel — needs visual confirmation, same as every phase's frontend work.

Phase 11 is done.

---

# Phase 12 (detailed): Goal CRUD — ✅ DONE

## Context

The `Goal` model (`targetValue`, `targetDate`, `status`, `progressNote`) exists and is already *read* by the AI coach for context (`coachContextService.ts`), but nothing ever writes to it. No schema migration needed.

## Backend (`server/src`)

**`src/services/goalService.ts`** (new) — `createGoal(userId, { goalType, targetValue?, targetDate?, progressNote? })`, `listGoals(userId)`, `updateGoal(userId, goalId, { targetValue?, targetDate?, progressNote? })` (ownership-scoped), `completeGoal(userId, goalId)` / `abandonGoal(userId, goalId)` (sets `status`/`completedAt` — this **is** the "delete," matching the org's soft-state convention: no hard delete on this model, `status` transitions instead).

**`src/validators/goal.validators.ts`**, **`src/controllers/goal.controller.ts`**, **`src/routes/goal.routes.ts`** — standard trio matching every other domain. Mounted at `/api/goals`.

**`src/services/progressService.ts`** — optional light touch: grant `GOAL_PROGRESS` XP (already an unused, anticipated `XpSource` value) when `completeGoal` fires.

## Frontend (`src`)

**`src/features/goals/`** (new slice) — types, service, `useGoals`/`useCreateGoal`/`useUpdateGoal` hooks (`queryKeys.goals.list` already reserved, unused), `GoalCard` + `GoalForm` components.

**`src/pages/GoalsPage/GoalsPage.tsx`** (new) + `ROUTES.goals` + nav link — a dedicated page.

## Out of scope

- Automatic goal-progress tracking beyond the existing weight-goal check already in `progressService.ts`.
- Surfacing goals on the Dashboard as a new card.

## Verification

1. `server`: build, test.
2. Frontend: build/lint/test.
3. Manual, live: create a goal, confirm it appears in the coach's context, mark it complete, confirm XP is granted.

## Status: implemented and verified end-to-end

Code complete exactly per plan — zero migration. One correctness addition beyond the plan's literal wording: `completeGoal` also recomputes and updates `UserProgress.cachedRank` when the XP grant crosses a rank threshold (not just increments XP) — otherwise the displayed rank would go stale until the next daily log recalculated it. Kept deliberately "light touch" as scoped: no `RankHistory` row or rank-up notification for this event, unlike `applyDailyLog`'s handling. Backend build clean, 37/37 tests unaffected (no new pure logic to unit-test beyond thin Prisma wrappers, matching convention). Frontend build clean, lint unchanged (same 4 pre-existing errors), 21/21 tests.

**Live-verified against the real Supabase DB**: created a goal, updated its target value and note, confirmed persistence via a fresh `GET`. Asked the AI coach "What are my current goals?" and confirmed it correctly referenced the real goal's type and updated target — the first real exercise of `coachContextService.ts`'s pre-existing goal-reading code with actual data. Completed the goal — confirmed `+100 XP` landed on `UserProgress`, confirmed attempting to complete it again correctly 404s (no longer `ACTIVE`). Abandoned a second goal — confirmed it worked. Confirmed cross-user ownership scoping: a second test account got 404 trying to abandon the first user's goal, and its own goal list correctly showed empty (no leakage). Test accounts cleaned up, dev server stopped.

Not independently exercised in-browser: the `GoalsPage` UI itself (form, cards, complete/abandon buttons, nav link) — needs visual confirmation.

Phase 12 is done.

---

# Phase 13 (detailed): Activity-aware recommendations — ✅ DONE

## Context

Confirmed via direct code read: the workout-generation prompt (`workoutGenerationService.ts`'s `buildPrompt`) only uses static profile fields plus a list of previous exercise *names* to avoid repeating — it does not know adherence rate or logged weight trend. This is the thesis's "remain relevant as the user's recorded activities and progress change over time" requirement, only partially met today. No schema migration.

## Backend (`server/src`)

**`src/services/planService.ts`** — inside `generateAndSaveActivePlan`, before calling `generateExerciseDetail`, compute a compact `AdherenceSummary`: workout-completion rate over the last 14 days, current streak, and a simple weight-trend direction vs. goal (same comparison logic already used for the `goal_crusher` achievement, extracted into a small shared helper).

**`src/services/workoutGenerationService.ts`** — `buildPrompt` gains a "RECENT ADHERENCE" section with completion rate, streak, and weight-trend-vs-goal, plus explicit instruction: high adherence → progress difficulty/volume; low adherence → keep it approachable; no history → omit the section entirely rather than print misleading zeros.

## Frontend

No changes.

## Out of scope

- Changing `buildWorkoutSplit`'s day/focus skeleton logic itself.
- Any new metric collection.

## Verification

1. `server`: build, test (plus one new test asserting the adherence section is omitted for a zero-history user).
2. Manual, live: regenerate a plan for a test account with ~2 weeks of high-adherence logs, confirm the adherence section renders with real numbers; confirm it's cleanly omitted for a brand-new account.

## Status: implemented and verified end-to-end

Code complete exactly per plan. `buildPrompt` was exported (it was previously private) specifically so its adherence-rendering logic could be unit-tested directly with mock `AdherenceSummary` objects, rather than only indirectly through a live Gemini call. Backend build clean, 40/40 tests (37 + 3 new: section omitted when adherence is `null`, completion-rate/streak render correctly while an "unknown" weight trend is omitted, and a clear trend renders with the correct on-track wording).

**Live-verified against the real Supabase + Gemini setup**: generated a plan for a brand-new account with zero `DailyProgress` history — succeeded normally (`source: GEMINI`), confirming the `null`-adherence path doesn't break anything. Logged 14 real days of history on the same account (10/14 workouts completed, weight trending 82kg → 78.8kg) and independently confirmed those exact aggregate numbers directly via Prisma before regenerating — then regenerated the plan again and confirmed it again succeeded normally through the real Gemini API with the non-null adherence path now active. Frontend confirmed unaffected (build clean, 21/21 tests) since the plan explicitly required zero frontend changes — the API response shape is unchanged, only Gemini's prompt inputs differ server-side. Test account cleaned up, dev server stopped.

Not independently observable: the raw prompt text actually sent to Gemini in production (would require temporary debug instrumentation, not left in the codebase) — confidence here comes from the unit tests covering the exact rendering logic plus the successful real API round-trips in both the null and non-null cases.

Phase 13 is done.

---

# Phase 14 (detailed): Code quality / hygiene (moved to last, per instruction) — ✅ DONE

## Context

The original roadmap's "Ongoing" line, never started — resequenced to run last, after all the new thesis-driven phases above. Expanded from a 2-job CI plan to 3 jobs partway through, since `mobile/` now exists as a real package (it didn't when this phase was first scoped).

## What shipped

1. **CI pipeline** — `.github/workflows/ci.yml`, three jobs on every PR and push to `main`: frontend (`npm ci && npm run build && npm run lint && npm test`), backend (same, in `server/`, with fake-but-schema-valid env vars for `config/env.ts`'s eager Zod validation — safe because the existing test suite only unit-tests pure functions, never a real DB/Gemini call), mobile (`npm ci && npm run typecheck && npm run lint` — no `npm test`, since this package has no test suite).
2. **Fixed backend ESLint** — `server/eslint.config.js` (new): Node-scoped flat config (`globals.node` instead of the root config's `globals.browser`), same `@typescript-eslint` ruleset shape as root, with an `argsIgnorePattern: '^_'` rule override matching the codebase's existing underscore-prefix convention for Express's positional error-handler params. Backend lint now runs its own real config instead of erroring on the frontend's.
3. **Fixed a related bug found while wiring the above**: root's `eslint.config.js` had no `server`/`mobile` exclusion, so it was implicitly linting those packages' files too (with the wrong, browser-scoped globals) whenever ESLint's nested-config auto-discovery didn't kick in — not reliable to depend on for CI, since a CI job installing only one package's deps wouldn't have another's `node_modules` available for a nested config's own plugin imports to resolve. Fixed with an explicit `globalIgnores(['dist', 'server', 'mobile'])` in the root config.
4. **Zod version reconciliation** — upgraded `server` from `^3.24.1` to `^4.4.3` (frontend was already on v4). De-risked by cataloging every Zod API touchpoint server-side first (only basic, stable methods used — `.flatten()`'s shape is unchanged between v3 and v4). Verified via build/tests plus a live round-trip: a malformed request still gets a correct 400 with the same `.flatten()` error shape, a valid request still succeeds.
5. **Documented the unused-model decision** — added "INTENTIONALLY UNUSED (documented, not an oversight)" doc-comments above `StreakHistory`, `LeaderboardEntry`, `AdminAnalyticsSnapshot`, `Report`, and `SystemSetting` in `schema.prisma`, each with a specific 2–4 line rationale (e.g. `LeaderboardEntry`'s: the leaderboard is computed live because this codebase has no scheduler/cron on a Vercel serverless deploy target — the same reasoning already applied consistently since Phase 6). No migration needed — `npx prisma validate` confirmed the schema is still valid.
6. **Two more gaps found and fixed during final verification, beyond the original 4-item plan** (both were "is the CI actually green" checks, not scope creep — a CI pipeline that's red on day one from pre-existing debt defeats the point of adding it):
   - **`mobile/` had zero ESLint setup at all** — no config file, no `eslint`/`eslint-config-expo` devDependency. `npm run lint` (`expo lint`) failed outright ("all files matching the glob pattern are ignored"), since Expo's normal first-run auto-setup didn't run non-interactively. Fixed by installing `eslint` + `eslint-config-expo` via `npx expo install --dev` and adding `mobile/eslint.config.js` (flat config extending `eslint-config-expo/flat`, per the current SDK 57 docs at docs.expo.dev/guides/using-eslint). This surfaced 5 real (if trivial) `react/no-unescaped-entities` errors — raw apostrophes in JSX text across `leaderboard.tsx`, `log.tsx`, `plan.tsx`, `forgot-password.tsx`, `login.tsx` — fixed by escaping them (`&apos;`). One remaining `import/no-named-as-default-member` warning on `httpClient.ts`'s `axios.create(...)` call is a correct, intentional use of the default export — left as a warning, doesn't fail the build.
   - **Frontend's 2 lint errors, carried forward as "pre-existing" since Phase 1, finally fixed**: `AuthContext.tsx`'s `react-refresh/only-export-components` (exporting the `useAuth` hook alongside the `AuthProvider` component breaks Fast Refresh's HMR boundary detection) — fixed with a scoped, commented `eslint-disable-next-line` rather than extracting `useAuth` into its own file, since that would mean updating ~26 import sites across the codebase for a pure HMR nicety with no functional effect (out of proportion for this pass). `PlanGeneratorPage.tsx`'s `react-hooks/set-state-in-effect` (calling `setSelectedStyle` synchronously inside a `useEffect` keyed on `plan`) — fixed using React's documented "adjust state during render" pattern (comparing `plan.id` against a tracked `lastPlanId` and calling `setState` directly in the render body when it changes) instead of an effect, which avoids the extra cascading render the lint rule warns about.

## Verification

All three packages verified clean, together, as a final consolidated pass (not just per-change): backend (`npm run build && npm run lint && npm test`, both normally and with the exact fake CI env vars — 40/40 tests, 0 lint errors), frontend (`npm run build && npm run lint && npm test` — 21/21 tests, 0 lint errors, down from the 2 "pre-existing" errors every prior phase in this session carried forward), mobile (`npx tsc --noEmit && npm run lint` — 0 errors, 1 harmless warning). This is the first point in the whole engagement where all three packages lint with zero errors simultaneously.

Not independently exercised: an actual GitHub Actions run of `.github/workflows/ci.yml` (would require pushing/opening a PR) — confidence comes from having locally reproduced each job's exact steps and env, including the backend job's fake-env-var approach.

Phase 14 is done. This was the last planned phase in the roadmap.

## UI/UX + admin batch (VER-008)

Schema-free (no migration): `Profile.birthday` column is left in place but no longer collected/validated (web + mobile forms). Collapsible sidebar replaces the top navbar for logged-in users (logged-out visitors keep a public-only top bar; mobile uses an off-canvas sidebar opened from a top bar / the bottom tab "More"). Dashboard redesigned (hero "Today's Target" with progress bar, grouped User Progress / Fitness Activity panels, larger Weight Progress). Challenge invites are by username and reject unknown usernames. Goal abandon now goes through a confirm modal (shared `ConfirmDialog`), with a duplicate-request guard and an idempotent server endpoint. Admins can grant/revoke admin (`POST /api/admin/users/:id/grant-admin|revoke-admin`, ADMIN-only, not on self). Admin overview uses doughnut/bar/line charts backed by new `adminUsers` + `signupsByDay` stats.
