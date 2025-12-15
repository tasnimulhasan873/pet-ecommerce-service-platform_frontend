// Currency conversion utilities
const USD_TO_BDT_RATE = 120;

/**
 * Convert USD to BDT
 * @param {number} usd - Amount in USD
 * @returns {number} Amount in BDT
 */
const usdToBdt = (usd) => {
    return Math.round(usd * USD_TO_BDT_RATE);
};

/**
 * Convert BDT to USD
 * @param {number} bdt - Amount in BDT
 * @returns {number} Amount in USD
 */
const bdtToUsd = (bdt) => {
    return parseFloat((bdt / USD_TO_BDT_RATE).toFixed(2));
};

/**
 * Format BDT currency
 * @param {number} amount - Amount in BDT
 * @returns {string} Formatted BDT string (e.g., "৳2500")
 */
const formatBdt = (amount) => {
    return `৳${Math.round(amount).toLocaleString()}`;
};

/**
 * Format USD currency
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted USD string (e.g., "$25.50")
 */
const formatUsd = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Parse price string to number (handles both $ and ৳)
 * @param {string} priceString - Price string (e.g., "$25.99" or "৳3000")
 * @returns {number} Numeric value
 */
const parsePrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;
    return parseFloat(priceString.replace(/[$৳,]/g, ''));
};

module.exports = {
    USD_TO_BDT_RATE,
    usdToBdt,
    bdtToUsd,
    formatBdt,
    formatUsd,
    parsePrice
};
