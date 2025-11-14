import Order from "../models/order.js";
import Profile from "../models/profile.js";

/**
 * Get pending payments for a maker
 */
export const getMyPayments = async (req, res) => {
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    const orders = await Order.find({
      'makerPayments.makerId': makerId,
    }).lean();

    const payments = [];
    orders.forEach(order => {
      order.makerPayments?.forEach(payment => {
        if (payment.makerId === makerId) {
          payments.push({
            orderId: order.orderId,
            orderDate: order.createdAt,
            amount: payment.amount,
            commission: payment.commission,
            status: payment.status,
            paidAt: payment.paidAt,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
          });
        }
      });
    });

    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    return res.json(payments);
  } catch (error) {
    console.error("[payments] getMyPayments failed:", error);
    return res.status(500).json({ message: "Unable to load payments." });
  }
};

/**
 * Get maker payout summary
 */
export const getMyPayoutSummary = async (req, res) => {
  const makerId = req.user.uid;

  try {
    // Verify user is a maker
    const profile = await Profile.findOne({ userId: makerId });
    if (!profile || profile.role !== 'maker' || profile.makerStatus !== 'approved') {
      return res.status(403).json({ message: "Maker access required." });
    }

    return res.json({
      pending: profile.makerPayout?.pending || 0,
      paid: profile.makerPayout?.paid || 0,
      total: profile.makerPayout?.total || 0,
    });
  } catch (error) {
    console.error("[payments] getMyPayoutSummary failed:", error);
    return res.status(500).json({ message: "Unable to load payout summary." });
  }
};

/**
 * Get all pending payments (admin)
 */
export const getAllPendingPayments = async (req, res) => {
  try {
    const orders = await Order.find({
      'makerPayments.status': 'pending',
      'delivery.makerConfirmed': true,
    }).lean();

    const payments = [];
    orders.forEach(order => {
      order.makerPayments?.forEach(payment => {
        if (payment.status === 'pending') {
          payments.push({
            orderId: order.orderId,
            orderDate: order.createdAt,
            makerId: payment.makerId,
            makerName: payment.makerName,
            amount: payment.amount,
            commission: payment.commission,
            deliveryConfirmedAt: order.delivery?.makerConfirmedAt,
          });
        }
      });
    });

    // Sort by delivery date (oldest first - prioritize older deliveries)
    payments.sort((a, b) => new Date(a.deliveryConfirmedAt) - new Date(b.deliveryConfirmedAt));

    return res.json(payments);
  } catch (error) {
    console.error("[payments] getAllPendingPayments failed:", error);
    return res.status(500).json({ message: "Unable to load pending payments." });
  }
};

/**
 * Process payment (admin)
 */
export const processPayment = async (req, res) => {
  const { orderId, makerId } = req.params;
  const { paymentMethod, transactionId } = req.body;
  const adminId = req.user.uid;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const payment = order.makerPayments?.find(p => p.makerId === makerId && p.status === 'pending');
    if (!payment) {
      return res.status(404).json({ message: "Pending payment not found for this maker." });
    }

    // Update payment status
    payment.status = 'paid';
    payment.paidAt = new Date();
    payment.paidBy = adminId;
    payment.paymentMethod = paymentMethod || 'bank_transfer';
    payment.transactionId = transactionId;

    await order.save();

    // Update maker's payout totals
    await Profile.updateOne(
      { userId: makerId },
      {
        $inc: {
          'makerPayout.paid': payment.amount,
        },
        $dec: {
          'makerPayout.pending': payment.amount,
        },
      }
    );

    // TODO: Send payment confirmation email to maker

    return res.json({
      success: true,
      message: "Payment processed successfully.",
      payment,
    });
  } catch (error) {
    console.error("[payments] processPayment failed:", error);
    return res.status(500).json({ message: "Unable to process payment." });
  }
};

