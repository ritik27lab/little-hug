# Little Log API — suggested documentation (v1)

This documents the REST API the React Native app already expects (see
`src/services/api.ts` in the frontend project). Build the Node/Express +
Prisma backend against this and the frontend needs zero changes beyond
flipping `USE_MOCK = false`.

**Base URL:** `https://api.littlelog.app/v1`
**Auth:** Bearer JWT in `Authorization: Bearer <token>` header, except
`/auth/register` and `/auth/login`.
**Format:** JSON in, JSON out, except the multipart agenda-scan upload.

---

## Auth

### `POST /auth/register`
Create a parent account and start the free trial.

Request:
```json
{ "name": "Yash Patel", "email": "yash@example.com", "password": "••••••••" }
```
Response `201`:
```json
{ "token": "jwt...", "userId": "user_1", "email": "yash@example.com", "name": "Yash Patel" }
```

### `POST /auth/login`
Request: `{ "email": "...", "password": "..." }`
Response `200`: `{ "token": "jwt...", "userId": "user_1", "email": "..." }`

### `POST /auth/refresh`
Request: `{ "refreshToken": "..." }` → Response `200`: `{ "token": "jwt..." }`

---

## Children

### `GET /children`
List the authenticated user's children.
Response `200`: `Child[]`
```ts
interface Child {
  id: string;
  name: string;
  birthDate: string;       // ISO date
  daycareName: string;
  daycareLat: number;
  daycareLng: number;
  geofenceRadiusM: number;
  avatarColor: string;
}
```

### `POST /children`
Body: `Omit<Child, "id">` → Response `201`: `Child`

### `PATCH /children/:id`
Partial `Child` fields (e.g. updating `daycareLat`/`daycareLng` if the child
switches crèche). Response `200`: `Child`

### `DELETE /children/:id`
Response `204`.

---

## Drop-off / pickup events

### `GET /children/:id/events?date=YYYY-MM-DD`
Defaults to today if `date` omitted. Response `200`: `DropoffEvent[]`
```ts
interface DropoffEvent {
  id: string;
  childId: string;
  type: "dropoff" | "pickup";
  timestamp: string;        // ISO datetime
  source: "auto" | "manual";
  wifiSsid?: string | null;
}
```

### `POST /children/:id/events`
Manual correction from the app (the "Log drop-off / Log pickup" buttons).
Body: `{ "type": "dropoff" | "pickup", "timestamp": "...", "source": "manual" }`
Response `201`: `DropoffEvent`

### `POST /events/ingest`
**Not called by the UI.** Called by the on-device geofencing background task
when it detects an enter/exit transition. Should be idempotent (dedupe by
`childId` + `type` + rounded timestamp) since geofence transitions can fire
more than once.
Body: `{ "childId": "...", "type": "dropoff" | "pickup", "timestamp": "...", "wifiSsid": "..." }`
Response `201`: `DropoffEvent`

This endpoint is also what should trigger the push notification
("Aarav dropped off, 8:42") and update the attendance record for the day.

---

## Attendance / calendar

### `GET /children/:id/attendance?month=YYYY-MM`
Response `200`: `AttendanceDay[]`
```ts
type AttendanceStatus = "present" | "absent" | "closed" | "unknown";

interface AttendanceDay {
  date: string;             // ISO date
  childId: string;
  status: AttendanceStatus;
  dropoffTime?: string | null;
  pickupTime?: string | null;
  note?: string | null;
  correctedManually: boolean;
}
```
Server derives `status`/`dropoffTime`/`pickupTime` from that day's events
unless `correctedManually` is true, in which case the manual value wins.

### `PATCH /children/:id/attendance/:date`
Manual correction (tap a day in the calendar → pick present/absent/closed).
Body: `{ "status": "present" | "absent" | "closed" }`
Response `200`: `AttendanceDay` (sets `correctedManually: true`)

### `GET /children/:id/attendance/export?month=YYYY-MM`
Generates the PDF/CSV billing-dispute report.
Response `200`: `{ "url": "https://.../report.pdf" }` (signed, expiring URL)

---

## Agenda scans

### `GET /children/:id/agenda-scans`
Response `200`: `AgendaScan[]`
```ts
interface AgendaScan {
  id: string;
  childId: string;
  imageUri: string;
  scannedAt: string;
  weekOf: string;            // ISO date of that week's Monday
  detectedLanguage?: string | null;
  days: AgendaDay[];
}
interface AgendaDay {
  date: string;
  meals: string[];
  naps: string[];
  activities: { time?: string | null; label: string }[];
  notes: string[];
}
```

### `POST /children/:id/agenda-scans`
Multipart upload, field name `image`. The backend:
1. Stores the original image (S3/Azure Blob).
2. Sends it to Claude's vision API (Haiku 4.5 is enough — this is a
   structured-extraction task, not a reasoning-heavy one) with a prompt
   asking for the exact `AgendaDay[]` JSON shape above, in the agenda's
   original language plus an auto-detected language code.
3. Persists the parsed result and returns it.

Response `201`: `AgendaScan`
Response `422` if the image couldn't be parsed: `{ "error": "unreadable_image" }`

---

## Subscription

### `GET /subscription`
Response `200`:
```ts
interface Subscription {
  plan: "free" | "monthly" | "yearly";
  status: "trialing" | "active" | "past_due" | "canceled" | "none";
  trialEndsAt?: string | null;
  renewsAt?: string | null;
  childrenIncluded: number;
}
```

### `POST /subscription/webhook`
**Not called by the app.** Receiving endpoint for App Store Server
Notifications / Google Play Real-time Developer Notifications (or
RevenueCat's webhook if you route through them, which is the simpler
option given the frontend's `USE_MOCK` note). Updates the user's
`Subscription` row on purchase, renewal, cancellation, and billing-issue
events.

---

## Family sharing

### `GET /family`
Response `200`: `FamilyMember[]`
```ts
interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relation: "parent" | "grandparent" | "nanny" | "other";
  status: "invited" | "active";
}
```

### `POST /family/invite`
Body: `{ "email": "...", "relation": "parent" | "grandparent" | "nanny" | "other" }`
Sends an invite email/SMS with a deep link; creates a `status: "invited"`
row. When the invitee accepts (separate `POST /family/accept/:token`
endpoint, deep-linked), flip to `status: "active"` and grant them read
access (and write access for `parent`/`guardian`) to the same children.

---

## Suggested Prisma models (starting point)

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  children      ChildAccess[]
  subscription  Subscription?
}

model Child {
  id               String   @id @default(cuid())
  name             String
  birthDate        DateTime
  daycareName      String
  daycareLat       Float
  daycareLng       Float
  geofenceRadiusM  Int      @default(120)
  avatarColor      String
  access           ChildAccess[]
  events           DropoffEvent[]
  attendance       AttendanceDay[]
  agendaScans      AgendaScan[]
}

// Join table: which users can see/edit which children, and how
model ChildAccess {
  id       String  @id @default(cuid())
  userId   String
  childId  String
  relation String  // "parent" | "grandparent" | "nanny" | "other"
  status   String  // "invited" | "active"
  user     User    @relation(fields: [userId], references: [id])
  child    Child   @relation(fields: [childId], references: [id])

  @@unique([userId, childId])
}

model DropoffEvent {
  id        String   @id @default(cuid())
  childId   String
  type      String   // "dropoff" | "pickup"
  timestamp DateTime
  source    String   // "auto" | "manual"
  wifiSsid  String?
  child     Child    @relation(fields: [childId], references: [id])

  @@index([childId, timestamp])
}

model AttendanceDay {
  id                String   @id @default(cuid())
  childId           String
  date              DateTime @db.Date
  status            String   // "present" | "absent" | "closed" | "unknown"
  dropoffTime       String?
  pickupTime        String?
  note              String?
  correctedManually Boolean  @default(false)
  child             Child    @relation(fields: [childId], references: [id])

  @@unique([childId, date])
}

model AgendaScan {
  id               String   @id @default(cuid())
  childId          String
  imageUri         String
  scannedAt        DateTime @default(now())
  weekOf           DateTime @db.Date
  detectedLanguage String?
  days             Json     // AgendaDay[]
  child            Child    @relation(fields: [childId], references: [id])
}

model Subscription {
  id             String   @id @default(cuid())
  userId         String   @unique
  plan           String   // "free" | "monthly" | "yearly"
  status         String   // "trialing" | "active" | "past_due" | "canceled" | "none"
  trialEndsAt    DateTime?
  renewsAt       DateTime?
  childrenIncluded Int    @default(1)
  user           User     @relation(fields: [userId], references: [id])
}
```

## Notes for the build

- **Auth**: standard JWT access + refresh token pair; hash passwords with
  bcrypt/argon2.
- **Rate limiting**: put a light rate limit on `/children/:id/agenda-scans`
  specifically — it's the one endpoint with a real per-call cost (the vision
  API call).
- **Idempotency on `/events/ingest`**: this is the one endpoint a flaky phone
  network can call twice for the same real-world event — dedupe server-side.
- **Timezones**: store `AttendanceDay.date` and event timestamps in UTC,
  but compute "which day" a timestamp belongs to using the child's daycare
  timezone (from `daycareLat`/`daycareLng` or a stored IANA zone), not the
  server's timezone — otherwise a 11:58pm drop-off near a date boundary
  could log on the wrong day.
