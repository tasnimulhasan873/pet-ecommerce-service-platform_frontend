// Frontend Currency Utilities for Bangladesh
const USD_TO_BDT_RATE = 120;

// Export USD_TO_BDT constant
export const USD_TO_BDT = USD_TO_BDT_RATE;

/**
 * Convert USD to BDT
 * @param {number} usd - Amount in USD
 * @returns {number} Amount in BDT
 */
export const toBDT = (usd) => {
    return Math.round(parseFloat(usd || 0) * USD_TO_BDT_RATE);
};

// Keep backward compatibility
export const usdToBdt = toBDT;

/**
 * Convert BDT to USD
 * @param {number} bdt - Amount in BDT
 * @returns {number} Amount in USD
 */
export const bdtToUsd = (bdt) => {
    return parseFloat((parseFloat(bdt || 0) / USD_TO_BDT_RATE).toFixed(2));
};

/**
 * Format BDT currency
 * @param {number} amount - Amount in BDT
 * @returns {string} Formatted BDT string (e.g., "৳2,500")
 */
export const formatBdt = (amount) => {
    const num = Math.round(parseFloat(amount || 0));
    return `৳${num.toLocaleString()}`;
};

/**
 * Format USD currency
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted USD string (e.g., "$25.50")
 */
export const formatUsd = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Parse price string to number (handles both $ and ৳)
 * @param {string} priceString - Price string (e.g., "$25.99" or "৳3000")
 * @returns {number} Numeric value
 */
export const parsePrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;
    return parseFloat(String(priceString).replace(/[$৳,]/g, ''));
};
