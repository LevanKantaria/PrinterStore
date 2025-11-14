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

const makerProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String },
    location: { type: String },
    machines: [{
      brand: { type: String },
      model: { type: String },
      year: { type: Number },
      age: { type: Number },
    }],
    filamentBrands: [{ type: String }],
    experience: { type: Number }, // years
    productionCapacity: { type: String },
    portfolio: [{ type: String }], // image URLs
    bio: { type: String },
    verified: { type: Boolean, default: false },
    joinedDate: { type: Date },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      badReviews: { type: Number, default: 0 }, // reviews ≤ 2/5
    },
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
    role: {
      type: String,
      enum: ['customer', 'maker', 'admin'],
      default: 'customer',
    },
    makerStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected', 'disqualified'],
      default: 'none',
    },
    makerApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'MakerApplication' },
    makerProfile: { type: makerProfileSchema },
    makerPayout: {
      pending: { type: Number, default: 0 }, // GEL
      paid: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

