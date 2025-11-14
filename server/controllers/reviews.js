import Review from "../models/review.js";
import Order from "../models/order.js";
import Profile from "../models/profile.js";

/**
 * Submit review for an order
 */
export const submitReview = async (req, res) => {
  const { orderId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.uid;

  try {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: "You can only review your own orders." });
    }

    // Check if order is delivered
    if (order.status !== 'fulfilled' || !order.delivery?.makerConfirmed) {
      return res.status(400).json({ message: "Order must be delivered before reviewing." });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this order." });
    }

    // Get maker ID from order items
    const makerIds = [...new Set(order.items.map(item => item.makerId).filter(Boolean))];
    if (makerIds.length === 0) {
      return res.status(400).json({ message: "No maker found for this order." });
    }

    // Create review for each maker (if multiple makers in one order)
    const reviews = await Promise.all(
      makerIds.map(async (makerId) => {
        const review = await Review.create({
          orderId,
          userId,
          makerId,
          productId: order.items.find(item => item.makerId === makerId)?.productId,
          rating: Number(rating),
          comment: comment || '',
          orderDeliveredAt: order.delivery?.deliveredAt || order.delivery?.makerConfirmedAt,
        });

        // Update maker's rating
        await updateMakerRating(makerId);

        // Check for disqualification
        await checkMakerDisqualification(makerId);

        return review;
      })
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      reviews,
    });
  } catch (error) {
    console.error("[reviews] submitReview failed:", error);
    return res.status(500).json({ message: "Unable to submit review." });
  }
};

/**
 * Get reviews for a maker
 */
export const getMakerReviews = async (req, res) => {
  const { makerId } = req.params;

  try {
    const reviews = await Review.find({ makerId })
      .sort({ reviewedAt: -1 })
      .lean();

    return res.json(reviews);
  } catch (error) {
    console.error("[reviews] getMakerReviews failed:", error);
    return res.status(500).json({ message: "Unable to load reviews." });
  }
};

/**
 * Get my reviews (customer)
 */
export const getMyReviews = async (req, res) => {
  const userId = req.user.uid;

  try {
    const reviews = await Review.find({ userId })
      .sort({ reviewedAt: -1 })
      .lean();

    return res.json(reviews);
  } catch (error) {
    console.error("[reviews] getMyReviews failed:", error);
    return res.status(500).json({ message: "Unable to load reviews." });
  }
};

/**
 * Update maker's rating statistics
 */
async function updateMakerRating(makerId) {
  try {
    const reviews = await Review.find({ makerId }).lean();
    
    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = totalRating / reviews.length;
    const badReviews = reviews.filter(r => r.rating <= 2).length;

    await Profile.updateOne(
      { userId: makerId },
      {
        $set: {
          'makerProfile.rating.average': average,
          'makerProfile.rating.count': reviews.length,
          'makerProfile.rating.badReviews': badReviews,
        },
      }
    );
  } catch (error) {
    console.error("[reviews] updateMakerRating failed:", error);
  }
}

/**
 * Check if maker should be disqualified (2 bad reviews)
 */
async function checkMakerDisqualification(makerId) {
  try {
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker') {
      return;
    }

    const badReviewCount = profile.makerProfile?.rating?.badReviews || 0;

    if (badReviewCount >= 2) {
      // Disqualify maker
      await Profile.updateOne(
        { userId: makerId },
        {
          $set: {
            makerStatus: 'disqualified',
            role: 'customer', // Revert to customer
          },
        }
      );

      // Reject all pending products
      const marketplaceItem = (await import("../models/martketplaceItem.js")).default;
      await marketplaceItem.updateMany(
        { makerId, status: { $in: ['draft', 'pending_review'] } },
        { status: 'rejected' }
      );

      // Hold pending payments
      await Order.updateMany(
        {
          'makerPayments.makerId': makerId,
          'makerPayments.status': 'pending',
        },
        {
          $set: { 'makerPayments.$.status': 'held' },
        }
      );

      // TODO: Send disqualification email to maker
      // TODO: Notify admin

      console.log(`[reviews] Maker ${makerId} disqualified due to ${badReviewCount} bad reviews`);
    }
  } catch (error) {
    console.error("[reviews] checkMakerDisqualification failed:", error);
  }
}

