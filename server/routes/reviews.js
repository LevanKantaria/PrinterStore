import express from "express";
import {
  submitReview,
  getMakerReviews,
  getMyReviews,
} from "../controllers/reviews.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.post("/order/:orderId", submitReview);
router.get("/my", getMyReviews);
router.get("/maker/:makerId", getMakerReviews);

export default router;

