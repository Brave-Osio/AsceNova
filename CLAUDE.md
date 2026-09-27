# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

See `docs/ROADMAP.md` for the current gap analysis and phased roadmap (what's implemented vs. planned). Keep it updated as phases land.

## Repo layout

This is **three independent Node packages in one git repo**, not an npm workspace — each has its own `package.json`/lockfile/`node_modules`/`tsconfig.json`:
- **`/`** (root) — web frontend: React 19 + Vite + TypeScript + Tailwind v4. Package name `ai-fitness-advisor`.
- **`/server`** — backend: Express + TypeScript + Prisma + PostgreSQL (Supabase). Package name `ascenova-server`.
- **`/mobile`** — native mobile app: Expo + React Native + TypeScript + Expo Router (file-based routing, routes live in `mobile/app/`; non-route code lives in `mobile/src/`). Talks to the same `server/` backend. See `mobile/AGENTS.md` for Expo-specific conventions (API churn warnings, `npx expo install` vs `npm install`, EAS build commands).

Run frontend commands from the repo root, backend commands from `server/`, and mobile commands from `mobile/`.

## Commands

### Frontend (repo root)
```
npm run dev         # vite dev server
npm run build        # tsc -b && vite build
npm run lint          # eslint .
npm test              # vitest run
npx vitest run src/path/to/file.test.ts   # single test file
```

### Backend (`server/`)
```
npm run dev                  # tsx watch src/server.ts
npm run build                 # tsc -b
npm test                       # vitest run
npx vitest run src/services/foo.test.ts   # single test file
npm run prisma:generate         # regenerate Prisma client after schema.prisma changes
npm run prisma:migrate           # create + apply a dev migration
npm run prisma:seed               # seed achievements + optional dev admin user (no-ops in production)
npm run prisma:studio              # browse the DB
```
Backend `npm run lint` currently has no working ESLint config of its own (falls through to the frontend's browser-scoped root config and errors) — known gap, not yet fixed.

### Mobile (`mobile/`)
```
npx expo start                # dev server (scan the QR with Expo Go, or press i/a for a simulator)
npx expo start --web           # run in a regular browser — no phone/simulator needed, good for a quick sanity check
npx tsc --noEmit                # typecheck
npx expo lint                    # lint
npx expo-doctor                   # diagnose dependency/config issues
npx expo install <package>         # ALWAYS use this instead of npm install for Expo/RN packages — resolves SDK-compatible versions
```
`npx expo-doctor` flags a "duplicate react" warning (one copy in `mobile/node_modules`, one in the repo root's, since this isn't an npm workspace) — this is expected for this repo's independent-packages structure and doesn't affect bundling (verified via a clean `npx expo export --platform web`); no action needed unless a real runtime "two React instances" error shows up.

### Environment
All three packages need a local `.env`:
- Frontend: `.env.local` at repo root — just `VITE_API_BASE_URL` (see `.env.example`).
- Backend: `server/.env` — Supabase connection strings, JWT secret, `GEMINI_API_KEY`/`GEMINI_MODEL` (see `server/.env.example` for the full list and format notes, e.g. use the **pooler host** for both `DATABASE_URL` and `DIRECT_URL` if your network lacks IPv6 — Supabase's direct-connection host is IPv6-only).
- `server/src/config/env.ts` validates `process.env` eagerly at import time via Zod and throws if a required var is missing. `server.ts` loads `.env` via `import 'dotenv/config'` at the top — any script that imports something which transitively pulls in `config/env.ts` needs that same dotenv load (see `server/vitest.config.ts`'s `setupFiles`).
- Mobile: `mobile/.env` — just `EXPO_PUBLIC_API_BASE_URL` (see `mobile/.env.example`; note the LAN-IP caveat there for testing on a physical device via Expo Go, since `localhost` on-device means the device itself, not your dev machine).

## Architecture

### Backend request flow
`routes/*.routes.ts` → `middleware/requireAuth.ts` (verifies JWT, re-checks live user status/deleted flag on every request) → `middleware/validateRequest.ts` (Zod-parses `req.body`, replacing it) → `controllers/*.controller.ts` (thin: `try { await service.fn(req.user!.id, ...) } catch (err) { next(err) }`) → `services/*.ts` (business logic, talks to Prisma directly) → `middleware/errorHandler.ts` (last-registered; maps `HttpError(status, message)` → JSON, `ZodError` → 400, Prisma `P2002` → 409, else 500).

`req.user` is only ever `{ id, role }` (set by `requireAuth`, typed in `src/types/express.d.ts`). `requireRole('ADMIN')` gates all of `/api/admin/*` (see `routes/admin.routes.ts`) — the only admin-only endpoints in the app.

Multi-model reads follow one of two patterns depending on shape: a parent-with-nested-`include` query when there's a natural parent (see `leaderboardService.ts`, `coachContextService.ts`), or `Promise.all` of independent queries when there isn't (see `progressService.ts`). Multi-step writes that need atomicity use `prisma.$transaction`.

### Frontend structure
Feature-sliced under `src/features/<domain>/{components,hooks}`, thin `src/pages/*` wiring a feature into a route, one `src/services/<domain>.ts` per API domain (axios calls + API-shape-to-domain-shape mapping, "one exported function per concern"). Routes are a flat `RouteObject[]` in `src/app/routes.tsx` (not file-based) — most routes sit inside a `ProtectedRoute` layout-route guard; `AdminRoute` gates `/admin` and `/admin/users/:userId` (visible via the nav bar only when `useAuth().isAdmin`). TanStack Query keys are centralized in `src/lib/queryKeys.ts` — always add new query keys there rather than inlining arrays. Auth state is a plain React Context (`src/context/AuthContext.tsx`), not Redux/Zustand; the access token lives in memory only (`src/lib/httpClient.ts`, never localStorage) and is silently refreshed via an axios response interceptor on 401.

Mutation hooks follow one of two conventions depending on need: `useMutation` (React Query) for a plain request/response (see `useLogin.ts`, `usePlanGenerator.ts`), or a hand-rolled manual-async pattern with local `isSubmitting`/error state when you need finer control (optimistic updates, per-item loading state) — see `useDailyLog.ts`, `useCoachChat.ts`.

### Mobile structure
`mobile/app/` is Expo Router's file-based route tree — `(auth)/` (login/register/forgot-password) and `(app)/` (the authenticated tab bar: dashboard/plan/log/leaderboard/challenges/coach/settings) are route groups, switched between by `app/_layout.tsx`'s `Stack.Protected guard={isAuthenticated}` (all routes are always defined; only reachability changes with auth state — see docs.expo.dev/router/advanced/authentication). Non-route code (contexts, services, components, theme) lives in `mobile/src/`, mirroring the web app's services/hooks/components conventions as closely as RN allows — same TanStack Query + axios pattern, same Zod-validated forms via `react-hook-form`.

**The one real difference from the web app:** the refresh token can't ride an httpOnly cookie on a native app (no persistent cookie jar across app restarts), so `POST /api/auth/login`/`register`/`refresh` also return `refreshToken` directly in the JSON body (in addition to still setting the cookie, which the web client keeps using unaffected) — mobile stores it via `expo-secure-store` (`mobile/src/lib/httpClient.ts`) and sends it explicitly as a body field on `POST /api/auth/refresh`/`logout`. The backend accepts the token from **either** the cookie or the body, whichever is present (`server/src/controllers/auth.controller.ts`).

### AI integration (Gemini)
`server/src/lib/gemini.ts` is the only file that touches the `@google/genai` SDK — `generateCoachReply()` for free-form chat text, `generateStructuredContent<T>()` for JSON-schema-constrained output. Both throw `HttpError(503, ...)` if `GEMINI_API_KEY` is unset and `HttpError(502, ...)` on any request failure — there is no silent fallback to fake/canned output baked into this file. Callers decide what "unavailable" means for their feature:
- **AI Coach** (`chatService.ts`): a 502/503 propagates to the client as an error — there's no legitimate lesser substitute for a personalized chat reply.
- **Workout generation** (`workoutGenerationService.ts` + `planService.ts`): a Gemini failure is caught and the code falls back to the deterministic rule-based generator (`source: 'RULE_BASED_LEGACY'` vs `'GEMINI'` on `WorkoutPlan`) — a real, already-tested algorithm, not a stub. Follow this same "hard-fail vs. real fallback" judgment call for any new AI-backed feature rather than defaulting to one or the other.

Structured-output responses are validated with a Zod schema **in addition to** the Gemini `responseSchema` before ever touching the database — never trust raw LLM JSON as pre-validated.

### Data model
`server/prisma/schema.prisma` already anticipates most of this app's planned feature set (e.g. `Notification`, `Goal`, `AdminAnalyticsSnapshot`, `SystemSetting`, `StreakHistory`, `LeaderboardEntry` all exist but several are currently unwired to any service/route/UI). Check `docs/ROADMAP.md` before assuming a new feature needs a schema migration — it usually doesn't. Note: meal suggestions and food-preference/allergy data collection are deliberately out of scope — `NutritionPlan` only carries calories/macros/water (`buildNutritionTargets` in `planService.ts`); don't reintroduce `Meal`/`MealSuggestion`/`Profile.foodPreference` without checking with the team first.

### Testing gotchas
- Backend tests need `server/vitest.config.ts`'s `dotenv/config` setup to load `.env` before any test that transitively imports `config/env.ts` (e.g. via `lib/gemini.ts`).
- Frontend `vite.config.ts` scopes `test.include` to `src/**` on purpose — without it, Vitest run from the repo root also picks up and tries to run `server/`'s tests (different package, different env needs).
- `server/tsconfig.json` excludes `*.test.ts` from the build — otherwise `tsc -b` compiles tests into `dist/` and Vitest runs both the source and compiled copies.
