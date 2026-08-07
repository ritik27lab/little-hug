import axios from "axios";
import {
  Child,
  DropoffEvent,
  AttendanceDay,
  AgendaScan,
  Subscription,
  FamilyMember,
} from "@/types";
import {
  mockChildren,
  mockEvents,
  mockAttendance,
  mockAgendaScans,
  mockSubscription,
  mockFamily,
} from "./mockData";

// Flip this to false once the Node/Express + Prisma backend from
// api-documentation.md is deployed, and set EXPO_PUBLIC_API_URL.
const USE_MOCK = true;

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.littlelog.app/v1",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // TODO: attach the stored auth token once auth is wired up
  // config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------- Auth ----------
// POST /auth/register, POST /auth/login, POST /auth/refresh — see docs.
export async function login(email: string, _password: string) {
  if (USE_MOCK) {
    return delay({ token: "mock-token", userId: "user_1", email });
  }
  const { data } = await apiClient.post("/auth/login", {
    email,
    password: _password,
  });
  return data;
}

export async function register(name: string, email: string, _password: string) {
  if (USE_MOCK) {
    return delay({ token: "mock-token", userId: "user_1", email, name });
  }
  const { data } = await apiClient.post("/auth/register", {
    name,
    email,
    password: _password,
  });
  return data;
}

// ---------- Children ----------
// GET/POST /children, PATCH/DELETE /children/:id
export async function getChildren(): Promise<Child[]> {
  if (USE_MOCK) return delay(mockChildren);
  const { data } = await apiClient.get("/children");
  return data;
}

export async function addChild(child: Omit<Child, "id">): Promise<Child> {
  if (USE_MOCK) return delay({ ...child, id: `child_${Date.now()}` });
  const { data } = await apiClient.post("/children", child);
  return data;
}

// ---------- Drop-off / pickup events ----------
// GET /children/:id/events, POST /children/:id/events (manual correction),
// POST /events/ingest (called by the on-device geofencing task)
export async function getEvents(childId: string): Promise<DropoffEvent[]> {
  if (USE_MOCK) return delay(mockEvents.filter((e) => e.childId === childId));
  const { data } = await apiClient.get(`/children/${childId}/events`);
  return data;
}

export async function logManualEvent(
  childId: string,
  type: "dropoff" | "pickup",
  timestamp: string,
): Promise<DropoffEvent> {
  if (USE_MOCK) {
    return delay({
      id: `evt_${Date.now()}`,
      childId,
      type,
      timestamp,
      source: "manual",
    });
  }
  const { data } = await apiClient.post(`/children/${childId}/events`, {
    type,
    timestamp,
    source: "manual",
  });
  return data;
}

// ---------- Attendance / calendar ----------
// GET /children/:id/attendance?month=YYYY-MM, PATCH /attendance/:date
export async function getAttendance(childId: string): Promise<AttendanceDay[]> {
  if (USE_MOCK) return delay(mockAttendance[childId] ?? []);
  const { data } = await apiClient.get(`/children/${childId}/attendance`);
  return data;
}

export async function correctAttendance(
  childId: string,
  date: string,
  status: AttendanceDay["status"],
): Promise<AttendanceDay> {
  if (USE_MOCK) {
    return delay({
      date,
      childId,
      status,
      dropoffTime: null,
      pickupTime: null,
      note: null,
      correctedManually: true,
    });
  }
  const { data } = await apiClient.patch(
    `/children/${childId}/attendance/${date}`,
    { status },
  );
  return data;
}

export async function exportAttendanceReport(
  childId: string,
  month: string,
): Promise<{ url: string }> {
  if (USE_MOCK) return delay({ url: "https://example.com/mock-report.pdf" });
  const { data } = await apiClient.get(
    `/children/${childId}/attendance/export`,
    { params: { month } },
  );
  return data;
}

// ---------- Agenda scans ----------
// POST /children/:id/agenda-scans (multipart image upload), GET /children/:id/agenda-scans
export async function getAgendaScans(childId: string): Promise<AgendaScan[]> {
  if (USE_MOCK)
    return delay(mockAgendaScans.filter((a) => a.childId === childId));
  const { data } = await apiClient.get(`/children/${childId}/agenda-scans`);
  return data;
}

export async function scanAgendaImage(
  childId: string,
  imageUri: string,
): Promise<AgendaScan> {
  if (USE_MOCK) {
    return delay(
      {
        ...mockAgendaScans[0],
        id: `agenda_${Date.now()}`,
        childId,
        imageUri,
      },
      1200,
    );
  }
  const form = new FormData();
  form.append("image", {
    uri: imageUri,
    name: "agenda.jpg",
    type: "image/jpeg",
  } as any);
  const { data } = await apiClient.post(
    `/children/${childId}/agenda-scans`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

// ---------- Subscription ----------
// GET /subscription, POST /subscription/webhook (store -> server, not called from app)
export async function getSubscription(): Promise<Subscription> {
  if (USE_MOCK) return delay(mockSubscription);
  const { data } = await apiClient.get("/subscription");
  return data;
}

// ---------- Family sharing ----------
// GET /family, POST /family/invite
export async function getFamily(): Promise<FamilyMember[]> {
  if (USE_MOCK) return delay(mockFamily);
  const { data } = await apiClient.get("/family");
  return data;
}

export async function inviteFamilyMember(
  email: string,
  relation: FamilyMember["relation"],
): Promise<FamilyMember> {
  if (USE_MOCK) {
    return delay({
      id: `fam_${Date.now()}`,
      name: email.split("@")[0],
      email,
      relation,
      status: "invited",
    });
  }
  const { data } = await apiClient.post("/family/invite", { email, relation });
  return data;
}
