import express from "express";
import {
  getMyPayments,
  getMyPayoutSummary,
  getAllPendingPayments,
  processPayment,
} from "../controllers/payments.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// Maker endpoints
router.get("/my", getMyPayments);
router.get("/my/summary", getMyPayoutSummary);

// Admin endpoints
router.get("/admin/pending", requireAdmin, getAllPendingPayments);
router.post("/admin/:orderId/:makerId/process", requireAdmin, processPayment);

export default router;

