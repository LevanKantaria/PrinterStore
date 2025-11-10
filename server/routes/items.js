import express from "express";
import { deleteItem, getItems, listAllItems, updateItem, uploadItem } from "../controllers/items.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getItems);
router.get("/admin/all", requireAuth, requireAdmin, listAllItems);
router.post("/", requireAuth, requireAdmin, uploadItem);
router.put("/:id", requireAuth, requireAdmin, updateItem);
router.delete("/:id", requireAuth, requireAdmin, deleteItem);

export default router;