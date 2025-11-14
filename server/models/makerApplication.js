import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    age: { type: Number },
  },
  { _id: false }
);

const makerApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'Profile', index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    answers: {
      whatToSell: { type: String, required: true },
      machines: { type: [machineSchema], required: true },
      machineCount: { type: Number, required: true },
      filamentBrands: [{ type: String, required: true }],
      location: { type: String, required: true },
      experience: { type: Number },
      productionCapacity: { type: String },
      whyJoin: { type: String },
    },
    portfolioImages: [{ type: String }],
    termsAccepted: { type: Boolean, default: false, required: true },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: String }, // admin userId
    rejectionReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

makerApplicationSchema.index({ createdAt: -1 });
makerApplicationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("MakerApplication", makerApplicationSchema);

