import marketplaceItem from "../models/martketplaceItem.js";
import Profile from "../models/profile.js";
import { calculateCommission } from "../utils/commission.js";
import { sendProductReviewNotificationEmail } from "../utils/email.js";

// Maximum image size: 5MB (base64 encoded will be ~6.67MB)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_BASE64_SIZE_BYTES = Math.floor(MAX_IMAGE_SIZE_BYTES * 1.34); // ~6.7MB for base64

const validateImageSizes = (images) => {
  if (!Array.isArray(images)) {
    return { valid: false, message: "Images must be an array." };
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (typeof image !== 'string') {
      return { valid: false, message: `Image ${i + 1} must be a string (base64).` };
    }

    // Base64 strings start with data:image/...;base64,...
    // Calculate approximate original size from base64
    // Base64 encoding increases size by ~33%, so we check the base64 string size
    const base64Size = Buffer.byteLength(image, 'utf8');
    
    if (base64Size > MAX_BASE64_SIZE_BYTES) {
      const sizeMB = (base64Size / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        message: `Image ${i + 1} is too large (${sizeMB}MB). Maximum size is 5MB per image.` 
      };
    }
  }

  return { valid: true };
};

/**
 * Get maker's own products
 */
export const getMyProducts = async (req, res) => {
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    const products = await marketplaceItem
      .find({ makerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("[makerProducts] getMyProducts failed:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

/**
 * Create product as maker (status: pending_review)
 */
export const createProduct = async (req, res) => {
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    const {
      name,
      category,
      subCategory,
      images,
      price,
      description,
      colors,
    } = req.body;

    // Validate required fields
    if (!name || !category || !subCategory || !images || !price || !description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!Array.isArray(images) || images.length < 2) {
      return res.status(400).json({ message: "At least 2 images are required." });
    }

    // Validate image sizes
    const imageValidation = validateImageSizes(images);
    if (!imageValidation.valid) {
      return res.status(400).json({ message: imageValidation.message });
    }

    // Calculate commission
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: "Invalid price." });
    }
    const commission = calculateCommission(priceNum);

    // Create product with pending_review status
    const newProduct = await marketplaceItem.create({
      name,
      category,
      subCategory,
      images,
      price: price.toString(),
      description,
      colors: colors || [],
      creator: profile.displayName || profile.email || 'Maker',
      makerId,
      makerName: profile.displayName || profile.email,
      status: 'pending_review',
      commission,
      submittedForReviewAt: new Date(),
    });

    // Send notification email to admin
    try {
      sendProductReviewNotificationEmail({
        product: newProduct.toObject(),
        makerProfile: profile.toObject(),
        language: 'EN', // Admin emails in English
      }).catch((emailError) => {
        console.error("[makerProducts] Failed to send product review notification email:", emailError);
      });
    } catch (emailError) {
      console.error("[makerProducts] Failed to send product review notification email:", emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("[makerProducts] createProduct failed:", error);
    return res.status(500).json({ message: error.message || "Unable to create product." });
  }
};

/**
 * Update own product (only if status is draft or rejected)
 */
export const updateMyProduct = async (req, res) => {
  const { id } = req.params;
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    const product = await marketplaceItem.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Verify product belongs to maker
    if (product.makerId !== makerId) {
      return res.status(403).json({ message: "You can only edit your own products." });
    }

    // Only allow editing if status is draft or rejected
    if (!['draft', 'rejected'].includes(product.status)) {
      return res.status(400).json({
        message: "You can only edit products with 'draft' or 'rejected' status.",
      });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.makerId;
    delete updates.makerName;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Validate image sizes if images are being updated
    if (updates.images) {
      const imageValidation = validateImageSizes(updates.images);
      if (!imageValidation.valid) {
        return res.status(400).json({ message: imageValidation.message });
      }
    }

    // Recalculate commission if price changed
    if (updates.price) {
      const priceNum = parseFloat(updates.price);
      if (!isNaN(priceNum) && priceNum > 0) {
        updates.commission = calculateCommission(priceNum);
      }
    }

    // If updating, set status back to pending_review
    if (product.status === 'rejected') {
      updates.status = 'pending_review';
      updates.submittedForReviewAt = new Date();
      updates.reviewedAt = undefined;
      updates.reviewedBy = undefined;
      updates.rejectionReason = undefined;
    }

    const updatedProduct = await marketplaceItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // Send notification email to admin if product was resubmitted for review
    if (product.status === 'rejected' && updatedProduct.status === 'pending_review') {
      try {
        const makerProfile = await Profile.findOne({ userId: makerId });
        sendProductReviewNotificationEmail({
          product: updatedProduct.toObject(),
          makerProfile: makerProfile?.toObject() || { displayName: product.makerName },
          language: 'EN', // Admin emails in English
        }).catch((emailError) => {
          console.error("[makerProducts] Failed to send product review notification email:", emailError);
        });
      } catch (emailError) {
        console.error("[makerProducts] Failed to send product review notification email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return res.json(updatedProduct);
  } catch (error) {
    console.error("[makerProducts] updateMyProduct failed:", error);
    return res.status(500).json({ message: error.message || "Unable to update product." });
  }
};

/**
 * Delete own product
 */
export const deleteMyProduct = async (req, res) => {
  const { id } = req.params;
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    const product = await marketplaceItem.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Verify product belongs to maker
    if (product.makerId !== makerId) {
      return res.status(403).json({ message: "You can only delete your own products." });
    }

    // Only allow deletion if status is draft or rejected
    if (!['draft', 'rejected'].includes(product.status)) {
      return res.status(400).json({
        message: "You can only delete products with 'draft' or 'rejected' status.",
      });
    }

    await marketplaceItem.findByIdAndDelete(id);

    return res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("[makerProducts] deleteMyProduct failed:", error);
    return res.status(500).json({ message: "Unable to delete product." });
  }
};

