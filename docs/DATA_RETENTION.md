# Data retention, deletion and audit logging

Source of truth for what the application does with personal data. Keep this in sync with `src/constants/terms.ts` (user-facing copy).

## Account deletion

| Path | What happens | Code |
| --- | --- | --- |
| **Self-service** — Settings → Delete Account (`DELETE /api/auth/account`) | Requires typing `DELETE` **and** re-authentication (password, or a fresh Google ID token for Google-only accounts). The account is always the authenticated user's — never an id from the request. All personal data is erased immediately in one transaction and sessions are revoked. The last remaining admin cannot delete themselves. | `authService.deleteAccount`, `userErasureService.eraseUserData` |
| **Admin delete** (`DELETE /api/admin/users/:id`) | Soft delete (`deleted: true`, sessions revoked). Cannot sign in or call the API (`requireAuth` re-checks on every request). Erased by the retention job after `SOFT_DELETE_RETENTION_DAYS` (default 30). Audited. | `adminService.softDeleteUser`, `retentionService` |

### What erasure removes
Refresh tokens, password-reset tokens, chat messages, notifications, goals, water/weight logs, workout logs, daily progress, XP/rank/streak history, achievement progress, leaderboard entry, user progress, the user's challenge participations, workout plans (cascades to days, exercises, nutrition targets) and the profile.

### What is kept (and why)
- A **tombstone `users` row**: random id, email replaced with `deleted-<id>@deleted.invalid`, no password hash / Google id / recovery email, `status = DELETED`. It exists because shared records reference it (e.g. a `ChallengeInvite` the user started, with other people's participation) and deleting the row would cascade-delete other users' data. It cannot sign in and frees the original email for a new registration.
- Shared data: `Achievement`/`Challenge` definitions, other users' records.
- `audit_logs` rows (opaque ids only, no personal details).

### What we cannot erase
- **Database backups** are controlled by the database host (Supabase). Erased data may persist until backups expire on the host's schedule. Do not claim immediate backup erasure.
- **AI provider (Google Gemini)**: text sent to generate plans or coach replies is processed under the provider's terms and cannot be deleted by this app.

## Scheduled retention job

`GET /api/internal/cron/retention` (Vercel Cron, daily 03:00 UTC, see `server/vercel.json`). Authenticated with `Authorization: Bearer $CRON_SECRET` only — never a user JWT.

| Data | Rule | Setting (default) |
| --- | --- | --- |
| Admin-soft-deleted accounts | Erased + anonymised | `SOFT_DELETE_RETENTION_DAYS` (30) |
| Refresh tokens | Deleted 7 days after expiry/revocation | fixed |
| Password-reset tokens | Deleted 7 days after expiry/use | fixed |
| AI chat messages | Deleted when older than N days | `CHAT_RETENTION_DAYS` (90) |

**Safety:** the job is report-only unless `RETENTION_DRY_RUN=false`. To enable: set `CRON_SECRET` (≥16 chars) and `RETENTION_DRY_RUN=false` in the Vercel project, after reviewing a dry-run report from the endpoint.

## Admin privacy

Admin endpoints return minimal objects selected in the database query (id, username, role, status, createdAt, aggregate counts, XP/rank). The username is the login name (`users.email`); the separate recovery Gmail, full name, profile/health data, tokens and chat content are never returned. Admin user search matches id or username. The CSV export contains ids, usernames and aggregates only. Audit log usernames are resolved at read time (the immutable table stores ids only); erased accounts show as "deleted account".

## Audit log

`audit_logs` is append-only: no update/delete API exists, and a database trigger rejects `UPDATE`/`DELETE` on the table. Admin actions write their audit row **in the same transaction** as the change; failed actions record a `FAILURE` row (generic text only, never error messages or request bodies). Recorded: admin login (success, and failed password for admin accounts) / logout, suspend, reactivate, grant/revoke admin, delete, achievement edits, user export. Read via `GET /api/admin/audit-logs` (ADMIN only; filters: actorId, action, outcome, from, to; max page size 50).

## Daily progress and timezones

`DailyProgress`, `WaterLog`, `WorkoutLog` are keyed by calendar date (`@db.Date`), never reset or overwritten across days. The app has no per-user timezone: the **client sends its local calendar date** (`YYYY-MM-DD`), and the server accepts dates from 7 days ago to tomorrow (UTC), which covers every real timezone. The dashboard derives "today" from `useToday()`, which rolls over at local midnight and on window focus (handles sleep/background tabs), and refetches per-day queries.
