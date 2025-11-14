import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getProfile);
router.put("/", updateProfile);

export default router;

