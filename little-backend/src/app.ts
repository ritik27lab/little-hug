import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { UPLOAD_DIR } from "./services/storage.service";
import { swaggerSpec } from "./swagger";

import authRoutes from "./routes/auth.routes";
import childrenRoutes from "./routes/children.routes";
import eventsRoutes from "./routes/events.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import familyRoutes from "./routes/family.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "2mb" }));

  // Serves locally-stored agenda photos in dev. In production this goes
  // away entirely once storage.service.ts points at S3/Blob instead.
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  // Swagger UI needs its own relaxed CSP (the global helmet() above blocks
  // the inline scripts/styles it renders with) — this must be registered
  // before notFoundHandler below, or every request to /api-docs gets
  // caught by the catch-all 404 first and never reaches here.
  app.use(
    "/api-docs",
    (req: Request, res: Response, next: NextFunction) => {
      helmet({ contentSecurityPolicy: false })(req, res, next);
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
  app.use(
    "/api-docs",
    (req: Request, res: Response, next: NextFunction) => {
      helmet({ contentSecurityPolicy: false })(req, res, next);
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
  app.use("/v1/auth", authRoutes);
  app.use("/v1/children", childrenRoutes);
  app.use("/v1/events", eventsRoutes);
  app.use("/v1/subscription", subscriptionRoutes);
  app.use("/v1/family", familyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
