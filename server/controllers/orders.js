import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Order from "../models/order.js";
import Profile from "../models/profile.js";
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail, sendOrderStatusUpdateEmail, sendMakerOrderNotificationEmail } from "../utils/email.js";
import { generateUniqueDeliveryCode } from "../utils/deliveryCode.js";
import { calculateCommission, calculateMakerPayout } from "../utils/commission.js";

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
      makerId: item.makerId,
      makerName: item.makerName,
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
      language = "KA",
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

    // Calculate commissions and maker payments for each item
    const itemsWithCommission = items.map(item => {
      const unitPrice = item.unitPrice || 0;
      const quantity = item.quantity || 0;
      const commission = calculateCommission(unitPrice);
      const makerPayout = calculateMakerPayout(unitPrice, quantity, commission);
      
      // Log for debugging - remove in production
      if (item.makerId) {
        console.log(`[orders] Item ${item.name} has makerId: ${item.makerId}, makerName: ${item.makerName}`);
      } else {
        console.warn(`[orders] Item ${item.name} missing makerId!`);
      }
      
      return {
        ...item,
        commission,
        makerPayout,
      };
    });

    // Group maker payments by makerId
    const makerPaymentsMap = new Map();
    itemsWithCommission.forEach(item => {
      if (item.makerId) {
        if (!makerPaymentsMap.has(item.makerId)) {
          makerPaymentsMap.set(item.makerId, {
            makerId: item.makerId,
            makerName: item.makerName || 'Unknown',
            amount: 0,
            commission: 0,
          });
        }
        const payment = makerPaymentsMap.get(item.makerId);
        payment.amount += item.makerPayout || 0;
        payment.commission += (item.commission || 0) * (item.quantity || 0);
      }
    });

    const makerPayments = Array.from(makerPaymentsMap.values());

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
      items: itemsWithCommission,
      makerPayments: makerPayments,
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

    // Send confirmation email to customer
    if (req.user?.email) {
      sendOrderConfirmationEmail({
        to: req.user.email,
        order,
        user: req.user,
        language,
      }).catch((emailError) => {
        console.error("[orders] Failed to send confirmation email:", emailError);
      });
    }

    // Send notification email to admin (always in English for now)
    sendNewOrderNotificationEmail({
      order,
      user: req.user,
      language: 'EN', // Admin emails in English
    }).catch((emailError) => {
      console.error("[orders] Failed to send admin notification email:", emailError);
    });

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

export const getOrdersForMaker = async (req, res) => {
  const makerId = req.user.uid;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  try {
    // Find orders where at least one item has this maker's makerId
    const orders = await Order.find({
      'items.makerId': makerId
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return res.json(orders);
  } catch (error) {
    console.error("[orders] getOrdersForMaker failed:", error);
    return res.status(500).json({ message: "Unable to load maker orders." });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    // Try to find by _id first, then by orderId
    let order = await Order.findById(id).lean();
    if (!order) {
      order = await Order.findOne({ orderId: id }).lean();
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check access: user can access if:
    // 1. They are the customer (order.userId === userId)
    // 2. They are admin
    // 3. They are a maker and the order contains their products
    const isAdmin = req.user.isAdmin;
    const isCustomer = order.userId === userId;
    const isMaker = order.items?.some(item => item.makerId === userId);

    if (!isAdmin && !isCustomer && !isMaker) {
      return res.status(403).json({ message: "Access denied." });
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
  const userId = req.user.uid;
  const isAdmin = req.user.isAdmin;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    // Try to find by _id first (only if valid ObjectId), then by orderId
    let order = null;
    
    // Check if id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findById(id);
    }
    
    // If not found by _id or not a valid ObjectId, try by orderId
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check permissions: Admin can update any status, makers can only update to 'processing' or 'fulfilled'
    if (!isAdmin) {
      // Check if user is a maker for this order
      const isMaker = order.items?.some(item => item.makerId === userId);
      if (!isMaker) {
        return res.status(403).json({ message: "You are not authorized to update this order." });
      }
      
      // Makers can only update to 'processing' or 'fulfilled'
      if (status !== 'processing' && status !== 'fulfilled') {
        return res.status(403).json({ message: "Makers can only update order status to 'processing' or 'fulfilled'." });
      }
      
      // Makers can only update from 'payment_received' or 'processing' to 'processing' or 'fulfilled'
      if (order.status !== 'payment_received' && order.status !== 'processing') {
        return res.status(403).json({ message: "You can only update orders that are in 'payment_received' or 'processing' status." });
      }
    }

    const oldStatus = order.status;
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

    // Generate delivery code and send combined email if order is confirmed (payment_received or processing)
    let deliveryCode = null;
    if (oldStatus !== status && (status === 'payment_received' || status === 'processing')) {
      try {
        // Only generate if code doesn't exist
        if (!order.delivery?.code) {
          deliveryCode = await generateUniqueDeliveryCode(Order);
          order.delivery = order.delivery || {};
          order.delivery.code = deliveryCode;
          order.delivery.codeGeneratedAt = new Date();
          order.delivery.codeUsed = false;
          await order.save();
        } else {
          // Use existing code
          deliveryCode = order.delivery.code;
        }
      } catch (codeError) {
        console.error("[orders] Failed to generate delivery code:", codeError);
        // Don't fail the request if code generation fails
      }
    }

    // Send combined status update email (with delivery code if applicable) to customer if status changed
    if (oldStatus !== status) {
      try {
        const profile = await Profile.findOne({ userId: order.userId });
        if (profile?.email) {
          sendOrderStatusUpdateEmail({
            to: profile.email,
            order: order.toObject(),
            oldStatus,
            newStatus: status,
            note,
            deliveryCode: deliveryCode || order.delivery?.code || null, // Include delivery code if available
            language: 'KA', // Default language, can be made dynamic
          }).catch((emailError) => {
            console.error("[orders] Failed to send status update email:", emailError);
          });
        }
      } catch (profileError) {
        console.error("[orders] Failed to fetch profile for status update email:", profileError);
      }
    }

    // Send notification emails to makers when payment is received
    if (oldStatus !== status && (status === 'payment_received' || status === 'processing')) {
      try {
        // Group items by maker
        const makerItemsMap = new Map();
        order.items?.forEach(item => {
          if (item.makerId) {
            if (!makerItemsMap.has(item.makerId)) {
              makerItemsMap.set(item.makerId, {
                makerId: item.makerId,
                makerName: item.makerName || 'Unknown Maker',
                items: [],
                totalPayout: 0,
                totalCommission: 0,
              });
            }
            const makerData = makerItemsMap.get(item.makerId);
            makerData.items.push(item);
            makerData.totalPayout += item.makerPayout || 0;
            makerData.totalCommission += (item.commission || 0) * (item.quantity || 0);
          }
        });

        // Send email to each maker
        for (const [makerId, makerData] of makerItemsMap.entries()) {
          try {
            const makerProfile = await Profile.findOne({ userId: makerId });
            if (makerProfile?.email) {
              sendMakerOrderNotificationEmail({
                to: makerProfile.email,
                makerName: makerProfile.displayName || makerData.makerName,
                order: order.toObject(),
                makerItems: makerData.items,
                expectedPayout: makerData.totalPayout,
                totalCommission: makerData.totalCommission,
                deliveryCode: deliveryCode || order.delivery?.code || null,
                language: 'KA', // Default language, can be made dynamic
              }).catch((emailError) => {
                console.error(`[orders] Failed to send maker notification email to ${makerId}:`, emailError);
              });
            }
          } catch (makerError) {
            console.error(`[orders] Failed to fetch maker profile for ${makerId}:`, makerError);
          }
        }
      } catch (makerNotificationError) {
        console.error("[orders] Failed to send maker notifications:", makerNotificationError);
        // Don't fail the request if maker notifications fail
      }
    }

    return res.json(order);
  } catch (error) {
    console.error("[orders] updateOrderStatus failed:", error);
    console.error("[orders] Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Unable to update order.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

