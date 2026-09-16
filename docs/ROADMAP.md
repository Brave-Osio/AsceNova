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
| Authentication | ✅ Mostly done | Register/login/logout/refresh/forgot-password/reset-password all implemented, JWT access + rotating opaque refresh tokens (httpOnly cookie), bcrypt hashing, `requireAuth` middleware. **Gaps:** password-reset emails aren't actually sent (dev-only token echo); no email verification flow though `emailVerifiedAt` field exists; `requireRole` (RBAC) middleware exists but is **wired into zero routes** — no admin-only endpoint exists yet; no account-suspend endpoint despite `AccountStatus.SUSPENDED` existing. |
| User profile / onboarding | ✅ Done | `ProfileSetupForm` collects identity, body/goals, training, and schedule and persists to `Profile` via a real API. Food-preference/allergy fields were deliberately removed (see "Nutrition planner" below) — onboarding has no diet section. |
| Workout generator | ✅ Implemented (Phase 2 done) | `planService` calls Gemini to populate real `WorkoutExercise` rows (sets/reps/rest/tempo/target muscles/difficulty/equipment) plus per-day warm-up/cooldown/coaching tips/progression advice, with a rule-based fallback if Gemini is unavailable. See "Phase 2" below. |
| Nutrition planner | 🟡 Narrowed — calories/macros only | The PM cut the nutrition-planner *feature* (meal suggestions, food-preference collection) from scope, but confirmed the calorie/macro/water targets on the Plan page should stay. Current state: `NutritionPlan` (lean — calories/protein/carbs/fat/sodium/water only) generated per plan and shown in `NutritionPanel`; `MealSuggestion`/`Meal`/`MealLog` and `Profile.foodPreference`/`foodAllergies`/`medicalRestrictions` are removed for good. See "Phase 3" below for the full iteration history. |
| AI Fitness Coach | ✅ Implemented (Phase 1 done) | Real Gemini-backed chat: `server/src/lib/gemini.ts`, `coachContextService.ts`, `chatService.ts`, `/api/chat` routes; frontend `coachService.ts`/`useCoachChat.ts` rewritten to hit the real API; `/coach` gated behind `ProtectedRoute`. See "Phase 1" below. |
| Gamification | ✅ Mostly done | XP, 9-tier ranks (Iron→Radiant), streaks, 9 achievement rules, live leaderboard — all real, backend-computed, Prisma-backed, already migrated off mock/localStorage. **Gaps:** `StreakHistory` and `LeaderboardEntry` models are defined but unused (leaderboard is computed live instead of precomputed — a legitimate design choice, not necessarily a bug); no daily/weekly/monthly "missions," no badges/titles beyond achievements, no season resets, no level-up confetti/animation. |
| User dashboard | ✅ Implemented (Phase 5 done) | Now shows next workout, today's nutrition targets + habit-goal badges, a 28-day workout calendar strip, a weekly summary, and an AI-coach teaser (last message), alongside the existing rank/XP/streak/weight/achievements cards. All frontend-only, reusing existing endpoints — no new backend/migration. See "Phase 5" below. |
| Admin panel | ❌ Not built | Zero admin UI/pages. `AdminRoute` guard component exists but is wired into no route. `requireRole` middleware exists but wired into no backend route. Schema fully supports it (`AdminAnalyticsSnapshot`, `Report`, `Role.ADMIN`) but nothing reads/writes it. |
| Analytics | ❌ Not built | Same as admin — schema ready (`AdminAnalyticsSnapshot`), zero implementation. |
| Notifications | ✅ Implemented (Phase 4 done) | Achievement unlocks and rank-ups now persist as `Notification` rows (in addition to the existing inline `apply-log` response fields, unchanged). Notification bell in the navbar with unread badge, dropdown, mark-read/mark-all-read. Reminders and admin/system notification types are out of scope (no scheduler/admin panel yet). See "Phase 4" below. |
| Settings | ❌ Not built | No settings page/route/service exists at all (profile editing exists via the setup form, but no dedicated account/security/theme/notification-prefs page). |
| UI/UX redesign | 🟡 Partial | Already dark-themed with glassmorphism (`.glass`/`.glass-strong`), purple/violet accents, Framer Motion animations, custom Tailwind v4 theme tokens — closer to the brief's aesthetic goal than a typical capstone UI. Hand-rolled component primitives (no shadcn/Radix). No light mode (not requested elsewhere). No loading skeletons/empty-state system audited yet at the per-page level. |
| Code quality | 🟡 Partial | Feature-sliced architecture, typed services, Zod validation, React Query caching already in place — genuinely good bones. Known debt: `requireRole` dead code, `StreakHistory`/`LeaderboardEntry` unused models, zod v3/v4 split, no CI pipeline at all. |

## Technical debt / risks noted (not yet fixed)

1. **No CI** — no `.github/workflows` or any CI config; typecheck/lint/test only run locally.
2. **`requireRole` middleware unused** — built, untested in production, zero call sites. Wiring it up is an auth/permission change (see policy note below).
3. **Zod version split** — server on v3, client on v4. Not urgent, but worth aligning before either side does more schema-sharing work.
4. **Password reset has no real email delivery** — currently dev-only token echo; needs a transactional email provider before this is production-safe.

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
6. **Phase 6 — Admin panel + analytics (flagged for auth sign-off).** Not started. Wire `requireRole`/`AdminRoute` into real admin routes/pages; build analytics aggregation into `AdminAnalyticsSnapshot`; user management (view/suspend/delete-soft) with CSV/Excel export.
7. **Phase 7 — Settings + auth hardening (flagged for auth sign-off).** Not started. Settings page (profile/security/theme/notification prefs), real password-reset email delivery, optional email verification.
8. **Phase 8 — Gamification expansion.** Not started. Missions (daily/weekly/monthly), badges/titles, season resets, level-up animation polish — additive, lowest risk to existing systems.
9. **Ongoing — code quality / hygiene.** Add CI (typecheck + lint + test on PR), reconcile zod versions, decide fate of unused `StreakHistory`/`LeaderboardEntry` models (populate them or remove).

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
