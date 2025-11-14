/**
 * Commission Calculation Utilities
 * 
 * Commission formula: max(1 GEL, 10% of product price)
 */

/**
 * Calculate commission for a product
 * 
 * @param {number} productPrice - Product price in GEL
 * @returns {number} Commission amount in GEL
 */
export function calculateCommission(productPrice) {
  if (!productPrice || productPrice <= 0) {
    return 0;
  }
  
  const percentage = productPrice * 0.10; // 10%
  return Math.max(1, percentage); // max(1 GEL, 10%)
}

/**
 * Calculate maker payout for an order item
 * 
 * @param {number} unitPrice - Unit price in GEL
 * @param {number} quantity - Quantity
 * @param {number} commission - Commission per unit
 * @returns {number} Maker payout amount in GEL
 */
export function calculateMakerPayout(unitPrice, quantity, commission) {
  const totalRevenue = unitPrice * quantity;
  const totalCommission = commission * quantity;
  return totalRevenue - totalCommission;
}

/**
 * Calculate commission and payout for order items
 * 
 * @param {Array} items - Order items with unitPrice and quantity
 * @returns {Array} Items with commission and makerPayout added
 */
export function calculateOrderCommissions(items) {
  return items.map(item => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const commission = calculateCommission(unitPrice);
    const makerPayout = calculateMakerPayout(unitPrice, quantity, commission);
    
    return {
      ...item,
      commission,
      makerPayout,
    };
  });
}

