import mongoose from "mongoose";

const marketplaceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 55,
  },
  category: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  subCategory: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  images: {
    type: Array,
    required: true,
    minlength: 2,
    trim: true,
  },
  colors: {
    type: [String],
    default: [],
  },

  price: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    maxlength: 15,
  },

  creator: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 550,
  },
  makerId: { type: String, ref: 'Profile' },
  makerName: { type: String },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'live'],
    default: 'draft',
    index: true,
  },
  reviewedAt: { type: Date },
  reviewedBy: { type: String }, // admin userId
  rejectionReason: { type: String },
  commission: { type: Number, default: 0 }, // calculated commission per unit
  submittedForReviewAt: { type: Date },
}, { timestamps: true });

const marketplaceItem = mongoose.model("marketplaceItem", marketplaceItemSchema);

export default marketplaceItem;
