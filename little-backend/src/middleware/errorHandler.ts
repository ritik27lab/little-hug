import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "validation_error",
      message: "Request data failed validation",
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.code, message: err.message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: "internal_error", message: "Something went wrong" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "not_found", message: `No route for ${req.method} ${req.path}` });
}
