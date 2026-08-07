import { format, subDays } from "date-fns";
import {
  Child,
  DropoffEvent,
  AttendanceDay,
  AgendaScan,
  Subscription,
  FamilyMember,
} from "@/types";

export const mockChildren: Child[] = [
  {
    id: "child_1",
    name: "Aarav",
    birthDate: "2023-04-12",
    daycareName: "Little Sprouts Crèche",
    daycareLat: 50.8503,
    daycareLng: 4.3517,
    geofenceRadiusM: 120,
    avatarColor: "#E8A33D",
  },
  {
    id: "child_2",
    name: "Mira",
    birthDate: "2021-11-02",
    daycareName: "Little Sprouts Crèche",
    daycareLat: 50.8503,
    daycareLng: 4.3517,
    geofenceRadiusM: 120,
    avatarColor: "#5B8C5A",
  },
];

const today = new Date();

export const mockEvents: DropoffEvent[] = [
  {
    id: "evt_1",
    childId: "child_1",
    type: "dropoff",
    timestamp: `${format(today, "yyyy-MM-dd")}T08:42:00`,
    source: "auto",
    wifiSsid: "LittleSprouts-Guest",
  },
];

function buildAttendanceHistory(childId: string): AttendanceDay[] {
  const days: AttendanceDay[] = [];
  for (let i = 0; i < 30; i++) {
    const d = subDays(today, i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    days.push({
      date: format(d, "yyyy-MM-dd"),
      childId,
      status: isWeekend ? "closed" : i === 3 ? "absent" : "present",
      dropoffTime: isWeekend || i === 3 ? null : "08:4" + (i % 5),
      pickupTime: isWeekend || i === 3 ? null : "17:1" + (i % 5),
      note: i === 3 ? "Sick day" : null,
      correctedManually: i === 3,
    });
  }
  return days;
}

export const mockAttendance: Record<string, AttendanceDay[]> = {
  child_1: buildAttendanceHistory("child_1"),
  child_2: buildAttendanceHistory("child_2"),
};

export const mockAgendaScans: AgendaScan[] = [
  {
    id: "agenda_1",
    childId: "child_1",
    imageUri: "",
    scannedAt: `${format(today, "yyyy-MM-dd")}T07:15:00`,
    weekOf: format(today, "yyyy-MM-dd"),
    detectedLanguage: "fr",
    days: [
      {
        date: format(today, "yyyy-MM-dd"),
        meals: [
          "Breakfast: fruit compote",
          "Lunch: vegetable soup, pasta",
          "Snack: yogurt",
        ],
        naps: ["12:30 – 14:30"],
        activities: [
          { time: "09:30", label: "Sensory play — water table" },
          { time: "10:30", label: "Outdoor time in the garden" },
          { time: "15:00", label: "Music & singing circle" },
        ],
        notes: ["Please bring a spare change of clothes on Thursday."],
      },
    ],
  },
];

export const mockSubscription: Subscription = {
  plan: "monthly",
  status: "trialing",
  trialEndsAt: format(subDays(today, -21), "yyyy-MM-dd"),
  renewsAt: null,
  childrenIncluded: 1,
};

export const mockFamily: FamilyMember[] = [
  {
    id: "fam_1",
    name: "You",
    email: "you@example.com",
    relation: "parent",
    status: "active",
  },
  {
    id: "fam_2",
    name: "Partner",
    email: "partner@example.com",
    relation: "parent",
    status: "invited",
  },
];
