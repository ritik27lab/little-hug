import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { parseAgendaImage } from "../services/claudeVision.service";
import { saveAgendaImage } from "../services/storage.service";
import { Prisma } from "@prisma/client";

function serializeScan(scan: {
  id: string;
  childId: string;
  imageUri: string;
  scannedAt: Date;
  weekOf: Date;
  detectedLanguage: string | null;
  days: unknown;
}) {
  return {
    id: scan.id,
    childId: scan.childId,
    imageUri: scan.imageUri,
    scannedAt: scan.scannedAt.toISOString(),
    weekOf: scan.weekOf.toISOString().slice(0, 10),
    detectedLanguage: scan.detectedLanguage,
    days: scan.days,
  };
}

export async function listAgendaScans(req: Request, res: Response) {
  const childId = req.params.id;
  const scans = await prisma.agendaScan.findMany({
    where: { childId },
    orderBy: { scannedAt: "desc" },
    take: 20,
  });
  res.status(200).json(scans.map(serializeScan));
}

export async function createAgendaScan(req: Request, res: Response) {
  const childId = req.params.id;
  const file = req.file;

  if (!file) {
    throw ApiError.badRequest("No image file was uploaded", "missing_image");
  }

  // 1. Parse the image with Claude's vision API.
  const parsed = await parseAgendaImage(file.buffer, file.mimetype);

  if (parsed.days.length === 0) {
    throw ApiError.unprocessable(
      "Couldn't find any days in that agenda photo",
      "unreadable_image",
    );
  }

  // 2. Persist the original image (swap saveAgendaImage's internals for
  //    S3/Blob storage in production).
  const imageUri = await saveAgendaImage(file.buffer, file.originalname);

  // 3. Store the parsed result. weekOf = the Monday of the first parsed day.
  const weekOf = mondayOf(parsed.days[0].date);

  const scan = await prisma.agendaScan.create({
    data: {
      childId,
      imageUri,
      weekOf: new Date(weekOf),
      detectedLanguage: parsed.detectedLanguage,
      days: parsed.days as unknown as Prisma.InputJsonValue,
    },
  });
  res.status(201).json(serializeScan(scan));
}

function mondayOf(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}
