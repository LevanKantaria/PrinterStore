import express from "express";
import {
  createOrder,
  getOrdersForUser,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/orders.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/admin/all", requireAdmin, listOrders);
router.post("/", createOrder);
router.get("/", getOrdersForUser);
router.get("/:id", getOrderById);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;

