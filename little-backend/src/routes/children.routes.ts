import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { requireChildAccess } from "../middleware/childAccess";
import { uploadAgendaImage } from "../middleware/upload";

import * as childrenController from "../controllers/children.controller";
import * as eventsController from "../controllers/events.controller";
import * as attendanceController from "../controllers/attendance.controller";
// import * as agendaController from "../controllers/agenda.controller";

const router = Router();

router.use(requireAuth);

// ---- Children ----
router.get("/", asyncHandler(childrenController.listChildren));
router.post("/", asyncHandler(childrenController.createChild));
router.patch(
  "/:id",
  requireChildAccess,
  asyncHandler(childrenController.updateChild),
);
router.delete(
  "/:id",
  requireChildAccess,
  asyncHandler(childrenController.deleteChild),
);

// ---- Events ----
router.get(
  "/:id/events",
  requireChildAccess,
  asyncHandler(eventsController.listEvents),
);
router.post(
  "/:id/events",
  requireChildAccess,
  asyncHandler(eventsController.createManualEvent),
);

// ---- Attendance ----
router.get(
  "/:id/attendance",
  requireChildAccess,
  asyncHandler(attendanceController.listAttendance),
);
router.patch(
  "/:id/attendance/:date",
  requireChildAccess,
  asyncHandler(attendanceController.correctAttendance),
);
router.get(
  "/:id/attendance/export",
  requireChildAccess,
  asyncHandler(attendanceController.exportAttendance),
);

// ---- Agenda scans ----
// router.get(
//   "/:id/agenda-scans",
//   requireChildAccess,
//   asyncHandler(agendaController.listAgendaScans),
// );
// router.post(
//   "/:id/agenda-scans",
//   requireChildAccess,
//   uploadAgendaImage.single("image"),
//   asyncHandler(agendaController.createAgendaScan)
// );

export default router;
