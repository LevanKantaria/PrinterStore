import Order from "../models/order.js";
import Profile from "../models/profile.js";
import { generateUniqueDeliveryCode, normalizeCode } from "../utils/deliveryCode.js";
import { sendDeliveryCodeEmail } from "../utils/deliveryEmail.js";
import { calculateOrderCommissions } from "../utils/commission.js";

/**
 * Generate and send delivery code when order is confirmed
 */
export const generateDeliveryCode = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if code already generated
    if (order.delivery?.code) {
      return res.json({
        code: order.delivery.code,
        alreadyGenerated: true,
      });
    }

    // Generate unique code
    const code = await generateUniqueDeliveryCode(Order);

    // Save code to order
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          'delivery.code': code,
          'delivery.codeGeneratedAt': new Date(),
          'delivery.codeUsed': false,
        },
      }
    );

    // Send code to customer via email
    try {
      await sendDeliveryCodeEmail(
        id,
        code,
        req.user.email,
        req.user.displayName || req.user.email,
        order.orderId,
        req.body.language || 'KA'
      );
    } catch (emailError) {
      console.error("[delivery] Failed to send code email:", emailError);
      // Don't fail the request if email fails
    }

    return res.json({
      code,
      message: "Delivery code generated and sent to customer.",
    });
  } catch (error) {
    console.error("[delivery] generateDeliveryCode failed:", error);
    return res.status(500).json({ message: "Unable to generate delivery code." });
  }
};

/**
 * Maker confirms delivery using code
 */
export const confirmDeliveryWithCode = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  const makerId = req.user.uid;

  try {
    // Try to find by _id first, then by orderId
    let order = await Order.findById(id);
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Validate code exists
    if (!order.delivery?.code) {
      return res.status(400).json({ message: "Delivery code not generated for this order." });
    }

    // Check if code already used
    if (order.delivery.codeUsed) {
      return res.status(400).json({ message: "Delivery code has already been used." });
    }

    // Validate code matches
    const normalizedCode = normalizeCode(code);
    if (order.delivery.code !== normalizedCode) {
      return res.status(400).json({ message: "Invalid delivery code." });
    }

    // Verify maker is assigned to this order
    const orderHasMaker = order.items.some(item => item.makerId === makerId);
    if (!orderHasMaker) {
      return res.status(403).json({ message: "You are not authorized to deliver this order." });
    }

    // Calculate commissions and maker payments if not already done
    let makerPayments = order.makerPayments || [];
    if (makerPayments.length === 0) {
      const itemsWithCommission = calculateOrderCommissions(order.items);
      
      // Group by maker
      const makerMap = new Map();
      itemsWithCommission.forEach(item => {
        if (item.makerId) {
          if (!makerMap.has(item.makerId)) {
            makerMap.set(item.makerId, {
              makerId: item.makerId,
              makerName: item.makerName || 'Unknown',
              amount: 0,
              commission: 0,
            });
          }
          const payment = makerMap.get(item.makerId);
          payment.amount += item.makerPayout || 0;
          payment.commission += (item.commission || 0) * (item.quantity || 0);
        }
      });

      makerPayments = Array.from(makerMap.values());
    }

    // Mark code as used and confirm delivery
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          'delivery.codeUsed': true,
          'delivery.codeUsedAt': new Date(),
          'delivery.makerConfirmed': true,
          'delivery.makerConfirmedAt': new Date(),
          'delivery.makerId': makerId,
          'delivery.deliveredAt': new Date(),
          status: 'fulfilled',
          makerPayments: makerPayments,
        },
        $push: {
          history: {
            status: 'fulfilled',
            note: `Delivery confirmed by maker using code ${normalizedCode}`,
            changedBy: makerId,
            changedAt: new Date(),
          },
        },
      }
    );

    // Update maker's pending payout
    for (const payment of makerPayments) {
      if (payment.makerId === makerId) {
        await Profile.updateOne(
          { userId: payment.makerId },
          {
            $inc: {
              'makerPayout.pending': payment.amount,
              'makerPayout.total': payment.amount,
            },
          }
        );
      }
    }

    return res.json({
      success: true,
      message: "Delivery confirmed successfully. Payment has been queued.",
    });
  } catch (error) {
    console.error("[delivery] confirmDeliveryWithCode failed:", error);
    return res.status(500).json({ message: "Unable to confirm delivery." });
  }
};

/**
 * Get delivery code (admin only, for support)
 */
export const getDeliveryCode = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).select('delivery orderId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({
      orderId: order.orderId,
      code: order.delivery?.code,
      codeGeneratedAt: order.delivery?.codeGeneratedAt,
      codeUsed: order.delivery?.codeUsed,
      codeUsedAt: order.delivery?.codeUsedAt,
    });
  } catch (error) {
    console.error("[delivery] getDeliveryCode failed:", error);
    return res.status(500).json({ message: "Unable to get delivery code." });
  }
};

