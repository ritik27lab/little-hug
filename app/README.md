# Little Log — mobile app (Expo / React Native)

Parent-first daycare tracking: automatic drop-off/pickup detection, AI-scanned
paper agendas, and a sticker-chart attendance calendar.

## Setup

```bash
npm install
npx expo start
```

Requires an `assets/icon.png` (1024×1024) before a real build — a placeholder
isn't included here.

## What's real vs. mocked right now

This is a frontend-only prototype. `src/services/api.ts` has a `USE_MOCK`
flag — everything currently reads from `src/services/mockData.ts` so every
screen is fully interactive without a backend.

To connect the real backend once it exists:
1. Set `USE_MOCK = false` in `src/services/api.ts`.
2. Set `EXPO_PUBLIC_API_URL` to the deployed API base URL.
3. Wire up token storage in the `apiClient` request interceptor.

The endpoint shapes in `api.ts` already match `api-documentation.md` — no
other frontend changes should be needed.

## Not yet implemented (noted for the backend/next phase)

- **Real geofencing**: `TodayScreen` shows drop-off/pickup events from the
  API but does not yet run `expo-location`'s background geofencing task.
  That needs `expo-task-manager` + `Location.startGeofencingAsync` wired to
  POST `/events/ingest` in the background, plus the Android/iOS permission
  flows.
- **Push notifications**: not wired up (`expo-notifications` would be added
  alongside the events API).
- **In-app purchase / subscription flow**: `SettingsScreen` displays
  subscription state from the API but doesn't yet call
  `react-native-purchases` (RevenueCat) to start a checkout — see the
  monetization plan from our earlier conversation for the trial/pricing
  structure this should drive toward.

## Project structure

```
src/
  theme/        design tokens (color, type, spacing) — see theme.ts header
                 for the design rationale
  types/        shared domain types, mirrored by the backend API
  services/     api.ts (service layer) + mockData.ts (prototype data)
  context/      auth + selected-child app state
  navigation/   root + bottom tab navigators
  screens/      Today, Agenda, Calendar, Family, Settings, auth/*
  components/   StatusStamp, ChildPill, PrimaryButton, AgendaDayCard,
                 CalendarGrid
```

## Design direction

Competitors in this category (Brightwheel, Procare, Famly) read as
institutional admin tools because they're sold to the daycare, not the
parent. Little Log's visual language is deliberately warmer and more
tactile — a deep pine/honey palette instead of generic SaaS blue, a serif
display face (Fraunces) instead of a default grotesk, and a recurring
"stamp"/sticker motif tying the digital calendar back to the paper sticker
charts parents already know from daycare. Full rationale is in
`src/theme/theme.ts`.
