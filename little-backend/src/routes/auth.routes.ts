import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.get("/health/little", async (req, res) => {
  const healthData = {
    uptime: process.uptime(),
    status: "OK",
    timestamp: Date.now(),
    memory: process.memoryUsage(),
  };

  try {
    // Optional: Add an async check to test database or external API connectivity here
    res.status(200).json(healthData);
  } catch (error) {
    healthData.status = "ERROR";
    res.status(503).json(healthData); // Service Unavailable
  }
});
router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));

export default router;
