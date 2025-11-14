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
    makerId: { type: String },
    makerName: { type: String },
    commission: { type: Number, default: 0 }, // commission per unit
    makerPayout: { type: Number, default: 0 }, // (unitPrice - commission) × quantity
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

const makerPaymentSchema = new mongoose.Schema(
  {
    makerId: { type: String, required: true },
    makerName: { type: String },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'held', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date },
    paidBy: { type: String }, // admin userId
    paymentMethod: { type: String }, // e.g., 'bank_transfer', 'paypal'
    transactionId: { type: String }, // for tracking
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    code: { type: String, sparse: true }, // Unique delivery code
    codeGeneratedAt: { type: Date },
    codeUsed: { type: Boolean, default: false },
    codeUsedAt: { type: Date },
    makerConfirmed: { type: Boolean, default: false },
    makerConfirmedAt: { type: Date },
    makerId: { type: String }, // Maker who confirmed delivery
    customerConfirmed: { type: Boolean, default: false },
    customerConfirmedAt: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
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
    makerPayments: { type: [makerPaymentSchema], default: [] },
    delivery: { type: deliverySchema },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'delivery.code': 1 }, { unique: true, sparse: true });

export default mongoose.model("Order", orderSchema);

