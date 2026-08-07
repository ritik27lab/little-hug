import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";

const correctSchema = z.object({
  status: z.enum(["present", "absent", "closed"]),
});

function serializeAttendance(day: {
  childId: string;
  date: Date;
  status: string;
  dropoffTime: string | null;
  pickupTime: string | null;
  note: string | null;
  correctedManually: boolean;
}) {
  return {
    date: day.date.toISOString().slice(0, 10),
    childId: day.childId,
    status: day.status,
    dropoffTime: day.dropoffTime,
    pickupTime: day.pickupTime,
    note: day.note,
    correctedManually: day.correctedManually,
  };
}

export async function listAttendance(req: Request, res: Response) {
  const childId = req.params.id;
  const month = typeof req.query.month === "string" ? req.query.month : undefined;

  const where = month
    ? {
        childId,
        date: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(nextMonth(month) + "-01T00:00:00.000Z"),
        },
      }
    : { childId };

  const days = await prisma.attendanceDay.findMany({ where, orderBy: { date: "asc" } });
  res.status(200).json(days.map(serializeAttendance));
}

export async function correctAttendance(req: Request, res: Response) {
  const childId = req.params.id;
  const date = req.params.date;
  const { status } = correctSchema.parse(req.body);

  const day = await prisma.attendanceDay.upsert({
    where: { childId_date: { childId, date: new Date(date) } },
    create: { childId, date: new Date(date), status, correctedManually: true },
    update: { status, correctedManually: true },
  });

  res.status(200).json(serializeAttendance(day));
}

export async function exportAttendance(req: Request, res: Response) {
  const childId = req.params.id;
  const month = typeof req.query.month === "string" ? req.query.month : new Date().toISOString().slice(0, 7);

  // Placeholder: generate a signed URL to a PDF/CSV report. Wire this up to
  // a real report generator (e.g. render a PDF with a library like pdfkit,
  // upload it, and return a short-lived signed URL) once storage is set up.
  const url = `https://example.com/reports/${childId}-${month}.pdf`;
  res.status(200).json({ url });
}

function nextMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m, 1));
  return date.toISOString().slice(0, 7);
}
