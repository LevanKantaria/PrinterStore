import marketplaceItem from "../models/martketplaceItem.js";
import { calculateCommission } from "../utils/commission.js";

/**
 * Get products pending review
 */
export const getPendingProducts = async (req, res) => {
  try {
    const products = await marketplaceItem
      .find({ status: 'pending_review' })
      .sort({ submittedForReviewAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("[adminProducts] getPendingProducts failed:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

/**
 * Approve product (set to live)
 */
export const approveProduct = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.uid;

  try {
    const product = await marketplaceItem.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.status !== 'pending_review') {
      return res.status(400).json({
        message: `Product is not pending review. Current status: ${product.status}`,
      });
    }

    // Ensure commission is calculated
    const priceNum = parseFloat(product.price);
    const commission = isNaN(priceNum) ? 0 : calculateCommission(priceNum);

    // Update product
    product.status = 'approved';
    product.reviewedAt = new Date();
    product.reviewedBy = adminId;
    product.commission = commission;

    // Make it live
    product.status = 'live';
    await product.save();

    return res.json({
      success: true,
      message: "Product approved and is now live.",
      product,
    });
  } catch (error) {
    console.error("[adminProducts] approveProduct failed:", error);
    return res.status(500).json({ message: "Unable to approve product." });
  }
};

/**
 * Reject product
 */
export const rejectProduct = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const adminId = req.user.uid;

  try {
    const product = await marketplaceItem.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.status !== 'pending_review') {
      return res.status(400).json({
        message: `Product is not pending review. Current status: ${product.status}`,
      });
    }

    // Update product
    product.status = 'rejected';
    product.reviewedAt = new Date();
    product.reviewedBy = adminId;
    product.rejectionReason = rejectionReason || 'Product did not meet quality standards.';

    await product.save();

    // TODO: Send rejection email to maker

    return res.json({
      success: true,
      message: "Product rejected.",
      product,
    });
  } catch (error) {
    console.error("[adminProducts] rejectProduct failed:", error);
    return res.status(500).json({ message: "Unable to reject product." });
  }
};

/**
 * Get all products with filters (admin)
 */
export const getAllProductsAdmin = async (req, res) => {
  const { status, makerId } = req.query;

  try {
    const query = {};
    if (status) {
      query.status = status;
    }
    if (makerId) {
      query.makerId = makerId;
    }

    const products = await marketplaceItem
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("[adminProducts] getAllProductsAdmin failed:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

