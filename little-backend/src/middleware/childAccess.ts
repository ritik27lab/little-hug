import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Loads the ChildAccess row for req.userId + req.params.id and attaches it
 * as req.childAccess. Use after requireAuth on any /children/:id/... route.
 */
export const requireChildAccess = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const childId = req.params.id;
    if (!req.userId) throw ApiError.unauthorized();

    const access = await prisma.childAccess.findUnique({
      where: { userId_childId: { userId: req.userId, childId } },
    });

    if (!access || access.status !== "active") {
      throw ApiError.notFound("Child not found");
    }

    req.childAccess = access;
    next();
  }
);
