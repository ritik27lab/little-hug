import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

const createChildSchema = z.object({
  name: z.string().min(1).max(120),
  birthDate: z.string(), // ISO date
  daycareName: z.string().min(1).max(200),
  daycareLat: z.number(),
  daycareLng: z.number(),
  geofenceRadiusM: z.number().int().positive().default(120),
  avatarColor: z.string().min(1).max(20),
});

const updateChildSchema = createChildSchema.partial();

function serializeChild(child: {
  id: string;
  name: string;
  birthDate: Date;
  daycareName: string;
  daycareLat: number;
  daycareLng: number;
  geofenceRadiusM: number;
  avatarColor: string;
}) {
  return {
    id: child.id,
    name: child.name,
    birthDate: child.birthDate.toISOString().slice(0, 10),
    daycareName: child.daycareName,
    daycareLat: child.daycareLat,
    daycareLng: child.daycareLng,
    geofenceRadiusM: child.geofenceRadiusM,
    avatarColor: child.avatarColor,
  };
}

export async function listChildren(req: Request, res: Response) {
  const access = await prisma.childAccess.findMany({
    where: { userId: req.userId, status: "active" },
    include: { child: true },
  });

  res.status(200).json(access.map((a: { child: Parameters<typeof serializeChild>[0] }) => serializeChild(a.child)));
}

export async function createChild(req: Request, res: Response) {
  const data = createChildSchema.parse(req.body);
  if (!req.userId) throw ApiError.unauthorized();

  const child = await prisma.child.create({
    data: {
      ...data,
      birthDate: new Date(data.birthDate),
      access: {
        create: { userId: req.userId, relation: "parent", status: "active" },
      },
    },
  });

  res.status(201).json(serializeChild(child));
}

export async function updateChild(req: Request, res: Response) {
  const childId = req.params.id;
  const data = updateChildSchema.parse(req.body);

  const child = await prisma.child.update({
    where: { id: childId },
    data: {
      ...data,
      ...(data.birthDate ? { birthDate: new Date(data.birthDate) } : {}),
    },
  });

  res.status(200).json(serializeChild(child));
}

export async function deleteChild(req: Request, res: Response) {
  const childId = req.params.id;
  await prisma.child.delete({ where: { id: childId } });
  res.status(204).send();
}
