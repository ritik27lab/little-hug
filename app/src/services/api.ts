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
import { getAccessToken } from "./tokenStore";

// Now pointing at your real backend — see .env's EXPO_PUBLIC_API_URL.
const USE_MOCK = false;

console.log("process.env.EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL);

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.littlelog.app/v1",
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------- Auth ----------
interface AuthResult {
  token: string;
  refreshToken?: string;
  userId: string;
  email: string;
  name?: string;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (USE_MOCK) {
    return delay({ token: "mock-token", userId: "user_1", email });
  }
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  if (USE_MOCK) {
    return delay({ token: "mock-token", userId: "user_1", email, name });
  }
  const { data } = await apiClient.post("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

// ---------- Children ----------
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
export async function getSubscription(): Promise<Subscription> {
  if (USE_MOCK) return delay(mockSubscription);
  const { data } = await apiClient.get("/subscription");
  return data;
}

// ---------- Family sharing ----------
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
