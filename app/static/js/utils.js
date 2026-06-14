// Shared utilities for unsu.com

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} - True if object is empty
 */
const _empty = (obj) => Object.keys(obj).length === 0;

/**
 * Get the base URL for API calls based on environment
 * @returns {string} - Base URL for API
 */
const getBaseUrl = () => {
  const host = document.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.');

  return isLocal
    ? `${document.location.protocol}//${host}:3333/api/resolver`
    : 'https://unsu.com/api/resolver';
};

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid address
 */
const isValidAddress = (address) => {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
};

/**
 * Validate ENS name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid ENS name
 */
const isValidEnsName = (name) => {
  return name.endsWith('.unsu.eth');
};

/**
 * Ensure name ends with .unsu.eth
 * @param {string} name - Name to normalize
 * @returns {string} - Normalized name
 */
const normalizeEnsName = (name) => {
  return name.endsWith('.unsu.eth') ? name : `${name}.unsu.eth`;
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _empty,
    getBaseUrl,
    isValidAddress,
    isValidEnsName,
    normalizeEnsName
  };
}
