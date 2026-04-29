import { DATE_FORMATS } from '../kpi/constants';

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    switch (format) {
        case DATE_FORMATS.DISPLAY:
            return `${monthNames[month]} ${day}, ${year}`;
        case DATE_FORMATS.API:
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        case DATE_FORMATS.PERIOD:
            return `${year}-${String(month + 1).padStart(2, '0')}`;
        case DATE_FORMATS.MONTH_YEAR:
            return `${fullMonthNames[month]} ${year}`;
        case DATE_FORMATS.YEAR:
            return String(year);
        case DATE_FORMATS.TIME:
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        default:
            return d.toLocaleDateString();
    }
};

/**
 * Parse date string
 * @param {string} dateStr - Date string
 * @returns {Date|null} Parsed date
 */
export const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Check if date is valid
 * @param {Date} date - Date to check
 * @returns {boolean} Whether date is valid
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Get start of day
 * @param {Date} date - Date
 * @returns {Date} Start of day
 */
export const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of day
 * @param {Date} date - Date
 * @returns {Date} End of day
 */
export const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Get start of month
 * @param {Date} date - Date
 * @returns {Date} Start of month
 */
export const startOfMonth = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of month
 * @param {Date} date - Date
 * @returns {Date} End of month
 */
export const endOfMonth = (date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Add days to date
 * @param {Date} date - Date
 * @param {number} days - Number of days
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

/**
 * Subtract days from date
 * @param {Date} date - Date
 * @param {number} days - Number of days
 * @returns {Date} New date
 */
export const subtractDays = (date, days) => {
    return addDays(date, -days);
};

/**
 * Get difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export const daysBetween = (date1, date2) => {
    const d1 = startOfDay(date1);
    const d2 = startOfDay(date2);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};