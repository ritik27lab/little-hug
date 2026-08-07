import "express";
import type { ChildAccess } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      childAccess?: ChildAccess;
    }
  }
}
