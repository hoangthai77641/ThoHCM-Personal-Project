/**
 * Format currency number to Vietnamese format
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Parse currency string back to number
 * @param {string} currencyString - Currency string like "100,000 ₫"
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remove currency symbol and separators
  const cleanString = currencyString.replace(/[₫,.\s]/g, '');
  const parsed = parseInt(cleanString, 10);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format  
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('vi-VN').format(number);
};