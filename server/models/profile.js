import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    company: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String },
    displayName: { type: String },
    phone: { type: String },
    company: { type: String },
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    preferences: {
      newsletterOptIn: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

