/**
 * Organisation Formatters
 * Formatting functions for dates, currency, numbers, etc.
 */

import { format, formatDistanceToNow, formatDistance } from 'date-fns';

// ============================================================
// Date Formatters
// ============================================================

/**
 * Format date to string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Date format (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatStr);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format time ago (short version)
 * @param {string|Date} date - Date to format
 * @returns {string} Short relative time
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'N/A';
  try {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return format(new Date(date), 'MMM dd');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  if (!startDate && !endDate) return 'N/A';
  if (!endDate) return start;
  return `${start} - ${end}`;
};

// ============================================================
// Currency Formatters
// ============================================================

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

/**
 * Format currency without decimal (for whole numbers)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency
 */
export const formatCurrencyWhole = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    NGN: '₦',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: '﷼',
    INR: '₹',
    CNY: '¥',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
  };
  return symbols[currency] || currency;
};

// ============================================================
// Number Formatters
// ============================================================

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-100)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
};

/**
 * Format decimal with specified precision
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimals (default: 2)
 * @returns {string} Formatted decimal
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format compact number (e.g., 1.2K, 3.4M)
 * @param {number} number - Number to format
 * @returns {string} Formatted compact number
 */
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
};

// ============================================================
// Phone & Address Formatters
// ============================================================

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1,3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

/**
 * Format address
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  const parts = [];
  if (address.address) parts.push(address.address);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);
  return parts.join(', ') || 'N/A';
};

// ============================================================
// Text Formatters
// ============================================================

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Convert string to title case
 * @param {string} text - Text to convert
 * @returns {string} Title case text
 */
export const toTitleCase = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert string to sentence case
 * @param {string} text - Text to convert
 * @returns {string} Sentence case text
 */
export const toSentenceCase = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// ============================================================
// KPI Formatters
// ============================================================

/**
 * Format KPI status
 * @param {string} status - KPI status
 * @returns {Object} Status config with label, color, icon
 */
export const formatKPIStatus = (status) => {
  const statusConfig = {
    on_track: { label: 'On Track', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
    at_risk: { label: 'At Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠️' },
    off_track: { label: 'Off Track', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🔴' },
    pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⏳' },
    approved: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
    rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100', icon: '❌' },
  };
  return statusConfig[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📊' };
};

// ============================================================
// Subscription Formatters
// ============================================================

/**
 * Format subscription status
 * @param {string} status - Subscription status
 * @returns {Object} Status config with label, color, icon
 */
export const formatSubscriptionStatus = (status) => {
  const statusConfig = {
    active: { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
    trialing: { label: 'Trial', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '🎁' },
    past_due: { label: 'Past Due', color: 'text-red-600', bgColor: 'bg-red-100', icon: '⚠️' },
    cancelled: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '❌' },
    expired: { label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100', icon: '⌛' },
  };
  return statusConfig[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📋' };
};