// frontend/src/utils/dashboard/dateHelpers.js
/**
 * Date utility functions for dashboard time-based operations
 */

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style (short, medium, long)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const formats = {
    short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    medium: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    long: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    datetime: d.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return formats[format] || formats.medium;
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Get date range for a period
 * @param {string} period - Period type (daily, weekly, monthly, quarterly, yearly)
 * @param {Date} referenceDate - Reference date (default: now)
 * @returns {Object} Start and end dates
 */
export const getDateRangeForPeriod = (period, referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  const start = new Date(now);
  const end = new Date(now);
  
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth((quarter + 1) * 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }
  
  return { start, end };
};

/**
 * Get previous period dates
 * @param {string} period - Period type
 * @param {Date} currentStart - Current period start date
 * @returns {Object} Previous period start and end dates
 */
export const getPreviousPeriod = (period, currentStart) => {
  const start = new Date(currentStart);
  const end = new Date(currentStart);
  
  switch (period) {
    case 'daily':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() - 1);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() - 1);
      end.setDate(0);
      break;
    case 'quarterly':
      start.setMonth(start.getMonth() - 3);
      end.setMonth(end.getMonth() - 1);
      end.setDate(0);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() - 1);
      end.setMonth(11, 31);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() - 1);
      end.setDate(0);
  }
  
  return { start, end };
};

/**
 * Get month names
 * @param {boolean} short - Use short names
 * @returns {string[]} Array of month names
 */
export const getMonthNames = (short = false) => {
  if (short) {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
};

/**
 * Get quarter number from month
 * @param {number} month - Month (0-11)
 * @returns {number} Quarter (1-4)
 */
export const getQuarterFromMonth = (month) => {
  return Math.floor(month / 3) + 1;
};

/**
 * Format period display
 * @param {string} periodType - Period type
 * @param {Date} date - Date
 * @returns {string} Formatted period string
 */
export const formatPeriod = (periodType, date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  
  switch (periodType) {
    case 'monthly':
      return `${getMonthNames(true)[d.getMonth()]} ${year}`;
    case 'quarterly':
      return `Q${getQuarterFromMonth(d.getMonth())} ${year}`;
    case 'yearly':
      return `${year}`;
    default:
      return formatDate(d, 'medium');
  }
};

/**
 * Check if date is within range
 * @param {Date} date - Date to check
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {boolean} True if within range
 */
export const isDateInRange = (date, start, end) => {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
};