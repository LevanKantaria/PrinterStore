import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, ref: 'Order', index: true },
    userId: { type: String, required: true, ref: 'Profile', index: true },
    makerId: { type: String, required: true, ref: 'Profile', index: true },
    productId: { type: String, ref: 'MarketplaceItem' },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String },
    isBadReview: {
      type: Boolean,
      default: function() {
        return this.rating <= 2;
      },
    },
    reviewedAt: { type: Date, default: Date.now },
    orderDeliveredAt: { type: Date }, // to track review window
  },
  { timestamps: true }
);

reviewSchema.index({ makerId: 1, isBadReview: 1 });
reviewSchema.index({ orderId: 1 }, { unique: true }); // One review per order

export default mongoose.model("Review", reviewSchema);

