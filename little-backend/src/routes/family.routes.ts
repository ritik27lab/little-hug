import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import * as familyController from "../controllers/family.controller";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(familyController.listFamily));
router.post("/invite", asyncHandler(familyController.inviteFamilyMember));

export default router;
