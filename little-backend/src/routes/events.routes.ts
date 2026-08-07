import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import * as eventsController from "../controllers/events.controller";

const router = Router();

router.use(requireAuth);
router.post("/ingest", asyncHandler(eventsController.ingestEvent));

export default router;
