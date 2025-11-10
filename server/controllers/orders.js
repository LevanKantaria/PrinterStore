import { v4 as uuidv4 } from "uuid";
import Order from "../models/order.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

const VALID_STATUSES = ["awaiting_payment", "payment_received", "processing", "fulfilled", "cancelled"];

const normalizeAddress = (address) =>
  address
    ? {
        fullName: address.fullName,
        company: address.company,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      }
    : undefined;

const sanitizeItems = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => ({
      productId: item.productId,
      name: item.name,
      material: item.material,
      color: item.color,
      quantity: Number(item.quantity) || 0,
      unitPrice: item.unitPrice != null ? Number(item.unitPrice) : undefined,
      lineTotal: item.lineTotal != null ? Number(item.lineTotal) : undefined,
      notes: item.notes,
      image: item.image,
    }))
    .filter((item) => item.name && item.quantity > 0);

export const createOrder = async (req, res) => {
  const userId = req.user.uid;

  try {
    const {
      items: rawItems = [],
      shippingAddress,
      billingAddress,
      customerNotes,
      currency = "USD",
      subtotal,
      shippingFee = 0,
      total,
      paymentDueBy,
    } = req.body || {};

    const items = sanitizeItems(rawItems);
    if (!items.length) {
      return res.status(400).json({ message: "At least one line item is required." });
    }

    const orderId = req.body.orderId || `FL-${uuidv4().split("-")[0].toUpperCase()}`;

    const computedSubtotal =
      subtotal != null
        ? Number(subtotal)
        : items.reduce((acc, item) => acc + (item.lineTotal != null ? item.lineTotal : 0), 0);

    const computedTotal = total != null ? Number(total) : computedSubtotal + Number(shippingFee || 0);

    const now = new Date();
    const createdOrder = await Order.create({
      orderId,
      userId,
      status: "awaiting_payment",
      paymentMethod: "bank_transfer",
      currency,
      subtotal: computedSubtotal,
      shippingFee: Number(shippingFee || 0),
      total: computedTotal,
      items,
      shippingAddress: normalizeAddress(shippingAddress),
      billingAddress: normalizeAddress(billingAddress),
      customerNotes,
      paymentDueBy: paymentDueBy ? new Date(paymentDueBy) : undefined,
      history: [
        {
          status: "awaiting_payment",
          note: "Order created and awaiting bank transfer.",
          changedBy: userId,
          changedAt: now,
        },
      ],
      lastStatusChangeBy: userId,
      lastStatusChangeAt: now,
    });

    const order = createdOrder.toObject();

    if (req.user?.email) {
      sendOrderConfirmationEmail({
        to: req.user.email,
        order,
        user: req.user,
      }).catch((emailError) => {
        console.error("[orders] Failed to send confirmation email:", emailError);
      });
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error("[orders] createOrder failed:", error);
    return res.status(500).json({ message: "Unable to create order." });
  }
};

export const getOrdersForUser = async (req, res) => {
  const userId = req.user.uid;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
    return res.json(orders);
  } catch (error) {
    console.error("[orders] getOrdersForUser failed:", error);
    return res.status(500).json({ message: "Unable to load orders." });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "You do not have access to this order." });
    }

    return res.json(order);
  } catch (error) {
    console.error("[orders] getOrderById failed:", error);
    return res.status(500).json({ message: "Unable to load order." });
  }
};

export const listOrders = async (req, res) => {
  const status = req.query.status;
  const query = {};

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter." });
    }
    query.status = status;
  }

  try {
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200).lean();
    return res.json(orders);
  } catch (error) {
    console.error("[orders] listOrders failed:", error);
    return res.status(500).json({ message: "Unable to load orders." });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body || {};

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const historyEntry = {
      status,
      note,
      changedBy: req.user.uid,
      changedAt: new Date(),
    };

    order.status = status;
    order.lastStatusChangeBy = req.user.uid;
    order.lastStatusChangeAt = historyEntry.changedAt;
    order.history.push(historyEntry);
    if (note) {
      order.adminNotes.push(note);
    }

    await order.save();

    return res.json(order);
  } catch (error) {
    console.error("[orders] updateOrderStatus failed:", error);
    return res.status(500).json({ message: "Unable to update order." });
  }
};

