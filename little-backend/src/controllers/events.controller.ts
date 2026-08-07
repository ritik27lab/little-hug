import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { recomputeAttendanceForDay } from "../services/attendance.service";

const eventTypeSchema = z.enum(["dropoff", "pickup"]);

const manualEventSchema = z.object({
  type: eventTypeSchema,
  timestamp: z.string(),
  source: z.literal("manual").default("manual"),
});

const ingestEventSchema = z.object({
  childId: z.string().min(1),
  type: eventTypeSchema,
  timestamp: z.string(),
  wifiSsid: z.string().optional().nullable(),
});

function serializeEvent(event: {
  id: string;
  childId: string;
  type: string;
  timestamp: Date;
  source: string;
  wifiSsid: string | null;
}) {
  return {
    id: event.id,
    childId: event.childId,
    type: event.type,
    timestamp: event.timestamp.toISOString(),
    source: event.source,
    wifiSsid: event.wifiSsid,
  };
}

export async function listEvents(req: Request, res: Response) {
  const childId = req.params.id;
  const dateParam = typeof req.query.date === "string" ? req.query.date : undefined;
  const date = dateParam ?? new Date().toISOString().slice(0, 10);

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const events = await prisma.dropoffEvent.findMany({
    where: { childId, timestamp: { gte: dayStart, lte: dayEnd } },
    orderBy: { timestamp: "desc" },
  });

  res.status(200).json(events.map(serializeEvent));
}

export async function createManualEvent(req: Request, res: Response) {
  const childId = req.params.id;
  const { type, timestamp } = manualEventSchema.parse(req.body);

  const event = await prisma.dropoffEvent.create({
    data: { childId, type, timestamp: new Date(timestamp), source: "manual" },
  });

  await recomputeAttendanceForDay(childId, timestamp.slice(0, 10));

  res.status(201).json(serializeEvent(event));
}

/**
 * Called by the app's background geofencing task, not by a signed-in-user
 * UI action — still requires a valid access token (the device's own user
 * token), but does not go through requireChildAccess since it identifies
 * the child directly in the body. Verify the token's user actually has
 * access to childId before writing.
 */
export async function ingestEvent(req: Request, res: Response) {
  const { childId, type, timestamp, wifiSsid } = ingestEventSchema.parse(req.body);

  const access = await prisma.childAccess.findUnique({
    where: { userId_childId: { userId: req.userId!, childId } },
  });
  if (!access || access.status !== "active") {
    throw ApiError.notFound("Child not found");
  }

  // Dedupe: ignore if an event of the same type was already logged for
  // this child within the last 5 minutes (geofence transitions can fire
  // more than once for the same real-world crossing).
  const fiveMinAgo = new Date(new Date(timestamp).getTime() - 5 * 60 * 1000);
  const duplicate = await prisma.dropoffEvent.findFirst({
    where: { childId, type, timestamp: { gte: fiveMinAgo } },
  });
  if (duplicate) {
    return res.status(200).json(serializeEvent(duplicate));
  }

  const event = await prisma.dropoffEvent.create({
    data: { childId, type, timestamp: new Date(timestamp), source: "auto", wifiSsid: wifiSsid ?? null },
  });

  await recomputeAttendanceForDay(childId, timestamp.slice(0, 10));

  // TODO: trigger push notification here, e.g.
  // await sendPushNotification(childId, type, event.timestamp)

  res.status(201).json(serializeEvent(event));
}
