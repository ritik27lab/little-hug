import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

const relationSchema = z.enum(["parent", "grandparent", "nanny", "other"]);

const inviteSchema = z.object({
  email: z.string().email(),
  relation: relationSchema,
});

export async function listFamily(req: Request, res: Response) {
  if (!req.userId) throw ApiError.unauthorized();

  // Everyone who shares access to any child this user has access to.
  const myAccess = await prisma.childAccess.findMany({ where: { userId: req.userId } });
  const childIds = myAccess.map((a: { childId: string }) => a.childId);

  const allAccess = await prisma.childAccess.findMany({
    where: { childId: { in: childIds } },
    include: { user: true },
    distinct: ["userId"],
  });

  interface AccessWithUser {
    id: string;
    userId: string;
    relation: string;
    status: string;
    user: { name: string; email: string };
  }

  res.status(200).json(
    allAccess.map((a: AccessWithUser) => ({
      id: a.id,
      name: a.userId === req.userId ? "You" : a.user.name,
      email: a.user.email,
      relation: a.relation,
      status: a.status,
    }))
  );
}

export async function inviteFamilyMember(req: Request, res: Response) {
  const { email, relation } = inviteSchema.parse(req.body);
  if (!req.userId) throw ApiError.unauthorized();

  // Invite applies to every child the inviting user currently has access to.
  const myAccess = await prisma.childAccess.findMany({ where: { userId: req.userId } });
  if (myAccess.length === 0) {
    throw ApiError.badRequest("Add a child before inviting family members");
  }

  let invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) {
    // Create a placeholder account; they'll set a password when they accept
    // the invite via the deep-linked accept flow.
    invitedUser = await prisma.user.create({
      data: { name: email.split("@")[0], email, passwordHash: "" },
    });
  }

  let lastAccess;
  for (const access of myAccess) {
    lastAccess = await prisma.childAccess.upsert({
      where: { userId_childId: { userId: invitedUser.id, childId: access.childId } },
      create: { userId: invitedUser.id, childId: access.childId, relation, status: "invited" },
      update: { relation, status: "invited" },
    });
  }

  // TODO: send an actual invite email/SMS with a deep link to accept.

  res.status(201).json({
    id: lastAccess!.id,
    name: invitedUser.name,
    email: invitedUser.email,
    relation,
    status: "invited",
  });
}
