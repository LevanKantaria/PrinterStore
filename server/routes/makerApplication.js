import express from "express";
import {
  submitApplication,
  getMyApplication,
  listApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
} from "../controllers/makerApplication.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// User endpoints
router.post("/", submitApplication);
router.get("/my", getMyApplication);

// Admin endpoints
router.get("/admin/all", requireAdmin, listApplications);
router.get("/admin/:id", requireAdmin, getApplicationById);
router.post("/admin/:id/approve", requireAdmin, approveApplication);
router.post("/admin/:id/reject", requireAdmin, rejectApplication);

export default router;

