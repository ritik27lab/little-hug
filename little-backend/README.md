# Little Log API (Node / Express / Prisma)

Implements every endpoint in `api-documentation.md`, matching the frontend's
`src/services/api.ts` exactly.

## Setup

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, JWT secrets, ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Server listens on `PORT` (default `4000`). Health check: `GET /health`.

This was written and type-checked (`npx tsc --noEmit`, zero errors) without
a live Postgres connection, so `prisma generate`/`migrate` are the first
things to run once you have a real `DATABASE_URL` — the Prisma client can't
initialize (and the server won't boot) until then.

## Structure

```
prisma/schema.prisma   All 6 models: User, Child, ChildAccess,
                        DropoffEvent, AttendanceDay, AgendaScan, Subscription
src/
  config/     env loader, Prisma client singleton
  middleware/ auth (JWT), childAccess (authorization), upload (multer),
              errorHandler
  routes/     one file per resource, thin — just wiring
  controllers/ request/response handling + validation (zod)
  services/   business logic that isn't pure CRUD:
              - claudeVision.service.ts: the agenda-photo → JSON parsing,
                using Claude Haiku 4.5 via @anthropic-ai/sdk
              - attendance.service.ts: derives AttendanceDay from events
              - storage.service.ts: local-disk image storage (dev) — swap
                for S3/Azure Blob in production, same function signature
  utils/      ApiError, asyncHandler, jwt helpers
```

## Key design decisions worth knowing about

- **Multi-user access via `ChildAccess`**: rather than a single `parentId`
  on `Child`, there's a join table so multiple users (both parents, a
  grandparent, a nanny) can share one child record — this is what the
  Family screen's invite flow relies on.
- **`/events/ingest` is separate from `/children/:id/events`**: the manual
  "Log drop-off" button in the app hits the latter; the background
  geofencing task hits the former. `ingest` dedupes by a 5-minute window
  since geofence transitions can fire more than once for the same crossing.
- **Attendance is derived, not directly written** — `AttendanceDay` rows are
  recomputed from that day's events every time an event is logged, unless
  `correctedManually` is true, in which case the manual correction wins and
  further auto-events won't overwrite it. This is what makes the "billing
  dispute" report trustworthy — it reflects real detected activity unless a
  parent explicitly overrode a day.
- **Subscription state comes from a webhook, not the app**: `POST
/subscription/webhook` is designed for RevenueCat's webhook (recommended
  over handling Apple/Google server notifications separately, per the
  monetization plan from our earlier conversation). Set `app_user_id` to
  this backend's `userId` at purchase time on the client so the webhook can
  map back to the right user.

## Not yet implemented

- Push notifications on drop-off/pickup detection (there's a `TODO` marker
  in `events.controller.ts` at the right spot).
- The invite-accept flow (`POST /family/accept/:token`) — invites are
  created in `invited` status but nothing flips them to `active` yet.
- Real PDF/CSV generation for the attendance export — currently returns a
  placeholder URL.
- Rate limiting on `/children/:id/agenda-scans` (the one endpoint with a
  real per-call cost).
