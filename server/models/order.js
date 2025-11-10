import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String },
    name: { type: String, required: true },
    material: { type: String },
    color: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number },
    lineTotal: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const orderHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    changedBy: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    company: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    phone: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["awaiting_payment", "payment_received", "processing", "fulfilled", "cancelled"],
      default: "awaiting_payment",
      index: true,
    },
    paymentMethod: { type: String, default: "bank_transfer" },
    currency: { type: String, default: "GEL" },
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: addressSnapshotSchema,
    billingAddress: addressSnapshotSchema,
    customerNotes: { type: String },
    adminNotes: { type: [String], default: [] },
    history: { type: [orderHistorySchema], default: [] },
    paymentDueBy: { type: Date },
    lastStatusChangeBy: { type: String },
    lastStatusChangeAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);

