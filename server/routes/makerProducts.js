import express from "express";
import {
  getMyProducts,
  createProduct,
  updateMyProduct,
  deleteMyProduct,
} from "../controllers/makerProducts.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/my", getMyProducts);
router.post("/", createProduct);
router.put("/:id", updateMyProduct);
router.delete("/:id", deleteMyProduct);

export default router;

