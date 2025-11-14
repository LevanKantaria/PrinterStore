import express from "express";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllProductsAdmin,
} from "../controllers/adminProducts.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/pending", getPendingProducts);
router.get("/all", getAllProductsAdmin);
router.post("/:id/approve", approveProduct);
router.post("/:id/reject", rejectProduct);

export default router;

