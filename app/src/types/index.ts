// Shared domain types. These map directly onto the API response shapes
// documented in api-documentation.md and the eventual Prisma models, so the
// frontend and backend stay in lockstep.

export type AttendanceStatus = "present" | "absent" | "closed" | "unknown";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "parent" | "guardian";
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO date
  daycareName: string;
  daycareLat: number;
  daycareLng: number;
  geofenceRadiusM: number;
  avatarColor: string; // hex, assigned client-side for the child "pill"
}

export interface DropoffEvent {
  id: string;
  childId: string;
  type: "dropoff" | "pickup";
  timestamp: string; // ISO datetime
  source: "auto" | "manual";
  wifiSsid?: string | null;
}

export interface AttendanceDay {
  date: string; // ISO date, no time
  childId: string;
  status: AttendanceStatus;
  dropoffTime?: string | null;
  pickupTime?: string | null;
  note?: string | null;
  correctedManually: boolean;
}

export interface AgendaActivity {
  time?: string | null;
  label: string;
}

export interface AgendaDay {
  date: string; // ISO date
  meals: string[];
  naps: string[];
  activities: AgendaActivity[];
  notes: string[];
}

export interface AgendaScan {
  id: string;
  childId: string;
  imageUri: string;
  scannedAt: string;
  weekOf: string; // ISO date of the Monday for that week
  days: AgendaDay[];
  detectedLanguage?: string | null;
}

export type SubscriptionPlan = "free" | "monthly" | "yearly";

export interface Subscription {
  plan: SubscriptionPlan;
  status: "trialing" | "active" | "past_due" | "canceled" | "none";
  trialEndsAt?: string | null;
  renewsAt?: string | null;
  childrenIncluded: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relation: "parent" | "grandparent" | "nanny" | "other";
  status: "invited" | "active";
}
