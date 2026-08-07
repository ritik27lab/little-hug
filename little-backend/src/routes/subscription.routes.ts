import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import * as subscriptionController from "../controllers/subscription.controller";

const router = Router();

router.get("/", requireAuth, asyncHandler(subscriptionController.getSubscription));

// Webhook is authenticated via a shared secret header, not a user JWT —
// RevenueCat calls this server-to-server, not through the app.
router.post("/webhook", asyncHandler(subscriptionController.handleRevenueCatWebhook));

export default router;
