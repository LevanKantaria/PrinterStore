import express from "express";
import {
  createOrder,
  getOrdersForUser,
  getOrdersForMaker,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/orders.js";
import {
  generateDeliveryCode,
  confirmDeliveryWithCode,
  getDeliveryCode,
} from "../controllers/delivery.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/admin/all", requireAdmin, listOrders);
router.post("/", createOrder);
router.get("/", getOrdersForUser);
router.get("/maker/my", getOrdersForMaker); // Maker orders endpoint - must be before /:id
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus); // Allow makers to update status too

// Delivery code endpoints
router.post("/:id/delivery-code", requireAdmin, generateDeliveryCode);
router.post("/:id/confirm-delivery", confirmDeliveryWithCode);
router.get("/:id/delivery-code", requireAdmin, getDeliveryCode);

export default router;

