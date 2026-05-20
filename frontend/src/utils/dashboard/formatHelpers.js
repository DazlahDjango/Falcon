// frontend/src/utils/dashboard/formatHelpers.js
/**
 * Format utility functions for dashboard display
 */

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '—';
  if (isNaN(num)) return '—';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {boolean} showSign - Show plus sign for positive
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, showSign = false) => {
  if (value === null || value === undefined) return '—';
  if (isNaN(value)) return '—';
  
  const formatted = `${Math.round(value)}%`;
  if (showSign && value > 0) return `+${formatted}`;
  return formatted;
};

/**
 * Format currency
 * @param {number} amount - Amount
 * @param {string} currency - Currency code (default: KES)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'KES') => {
  if (amount === null || amount === undefined) return '—';
  if (isNaN(amount)) return '—';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format compact number (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted compact number
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '—';
  if (isNaN(num)) return '—';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Format duration in seconds to human readable
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return '—';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format KPI name for display
 * @param {string} kpiName - KPI name
 * @returns {string} Formatted KPI name
 */
export const formatKpiName = (kpiName) => {
  if (!kpiName) return '';
  return kpiName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format status for display
 * @param {string} status - Status code
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  const statusMap = {
    green: 'On Track',
    yellow: 'At Risk',
    red: 'Off Track',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    critical: 'Critical',
    warning: 'Warning',
    info: 'Info'
  };
  return statusMap[status?.toLowerCase()] || status || '—';
};