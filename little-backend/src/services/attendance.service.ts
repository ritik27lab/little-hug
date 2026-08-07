import { prisma } from "../config/prisma";

/**
 * Recomputes and upserts the AttendanceDay row for a child on the given
 * date, based on that day's DropoffEvents — unless the day was corrected
 * manually, in which case the manual value is left untouched.
 *
 * Call this after any event is ingested (auto or manual).
 */
export async function recomputeAttendanceForDay(childId: string, dateStr: string): Promise<void> {
  const existing = await prisma.attendanceDay.findUnique({
    where: { childId_date: { childId, date: new Date(dateStr) } },
  });

  if (existing?.correctedManually) {
    return;
  }

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const events = await prisma.dropoffEvent.findMany({
    where: { childId, timestamp: { gte: dayStart, lte: dayEnd } },
    orderBy: { timestamp: "asc" },
  });

  interface EventRow {
    type: string;
    timestamp: Date;
  }

  const dropoff = events.find((e: EventRow) => e.type === "dropoff");
  const pickup = events.find((e: EventRow) => e.type === "pickup");

  const status = dropoff || pickup ? "present" : "unknown";

  await prisma.attendanceDay.upsert({
    where: { childId_date: { childId, date: new Date(dateStr) } },
    create: {
      childId,
      date: new Date(dateStr),
      status,
      dropoffTime: dropoff ? formatTime(dropoff.timestamp) : null,
      pickupTime: pickup ? formatTime(pickup.timestamp) : null,
      correctedManually: false,
    },
    update: {
      status,
      dropoffTime: dropoff ? formatTime(dropoff.timestamp) : null,
      pickupTime: pickup ? formatTime(pickup.timestamp) : null,
    },
  });
}

function formatTime(date: Date): string {
  return date.toISOString().slice(11, 16); // "HH:mm"
}
