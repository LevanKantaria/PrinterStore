/**
 * Delivery Code Generation and Validation
 * 
 * Generates unique, easy-to-read delivery codes for order confirmation.
 * Codes are 6-8 alphanumeric characters, uppercase only.
 */

/**
 * Generate a unique delivery code
 * Format: 6-8 uppercase alphanumeric characters
 * Excludes confusing characters: 0, O, I, 1
 * 
 * @returns {string} Unique delivery code
 */
export function generateDeliveryCode() {
  // Exclude confusing characters: 0, O, I, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  // Generate 6-character code (can be increased to 7 or 8 for more uniqueness)
  const codeLength = 6;
  
  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Validate delivery code format
 * 
 * @param {string} code - Code to validate
 * @returns {boolean} True if format is valid
 */
export function validateCodeFormat(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Remove whitespace and convert to uppercase
  const cleaned = code.trim().toUpperCase();
  
  // Check length (6-8 characters)
  if (cleaned.length < 6 || cleaned.length > 8) {
    return false;
  }
  
  // Check format: only alphanumeric, no confusing chars
  const validPattern = /^[A-HJ-NP-Z2-9]+$/;
  return validPattern.test(cleaned);
}

/**
 * Normalize delivery code (uppercase, trim)
 * 
 * @param {string} code - Code to normalize
 * @returns {string} Normalized code
 */
export function normalizeCode(code) {
  if (!code || typeof code !== 'string') {
    return '';
  }
  return code.trim().toUpperCase();
}

/**
 * Check if code is unique in database
 * 
 * @param {string} code - Code to check
 * @param {Object} OrderModel - Mongoose Order model
 * @returns {Promise<boolean>} True if code is unique
 */
export async function isCodeUnique(code, OrderModel) {
  if (!code || !OrderModel) {
    return false;
  }
  
  const normalized = normalizeCode(code);
  const existing = await OrderModel.findOne({ 
    'delivery.code': normalized,
    'delivery.codeUsed': false // Only check unused codes
  });
  
  return !existing;
}

/**
 * Generate a unique delivery code that doesn't exist in database
 * 
 * @param {Object} OrderModel - Mongoose Order model
 * @param {number} maxAttempts - Maximum attempts to generate unique code (default: 100)
 * @returns {Promise<string>} Unique delivery code
 */
export async function generateUniqueDeliveryCode(OrderModel, maxAttempts = 100) {
  let attempts = 0;
  let code;
  let isUnique = false;
  
  while (!isUnique && attempts < maxAttempts) {
    code = generateDeliveryCode();
    isUnique = await isCodeUnique(code, OrderModel);
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique delivery code after maximum attempts');
  }
  
  return code;
}

/**
 * Format code for display (add spacing for readability)
 * Format: ABC-123 or ABC 123
 * 
 * @param {string} code - Code to format
 * @param {string} separator - Separator character (default: ' ')
 * @returns {string} Formatted code
 */
export function formatCodeForDisplay(code, separator = ' ') {
  if (!code) {
    return '';
  }
  
  const normalized = normalizeCode(code);
  
  // Split into groups of 3 for readability
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}${separator}${normalized.slice(3)}`;
  }
  
  return normalized;
}

