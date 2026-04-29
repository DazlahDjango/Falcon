import { TRAFFIC_LIGHT, PRECISION } from './constants';
import { calculateScore } from './calculators';

/**
 * Get status from score
 * @param {number} score - Score value
 * @returns {string} Status (GREEN, YELLOW, RED)
 */
export const getStatusFromScore = (score) => {
    if (score >= TRAFFIC_LIGHT.GREEN.threshold) return 'GREEN';
    if (score >= TRAFFIC_LIGHT.YELLOW.threshold) return 'YELLOW';
    return 'RED';
};

/**
 * Get score class for styling
 * @param {number} score - Score value
 * @returns {string} CSS class name
 */
export const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
};

/**
 * Sort KPIs by status priority
 * @param {Array} kpis - Array of KPIs
 * @returns {Array} Sorted KPIs
 */
export const sortKPIsByStatus = (kpis) => {
    const priority = { RED: 0, YELLOW: 1, GREEN: 2 };
    return [...kpis].sort((a, b) => {
        return (priority[a.status] || 3) - (priority[b.status] || 3);
    });
};

/**
 * Filter KPIs by status
 * @param {Array} kpis - Array of KPIs
 * @param {string} status - Status to filter
 * @returns {Array} Filtered KPIs
 */
export const filterKPIsByStatus = (kpis, status) => {
    if (!status || status === 'ALL') return kpis;
    return kpis.filter(kpi => kpi.status === status);
};

/**
 * Group KPIs by category
 * @param {Array} kpis - Array of KPIs
 * @returns {Object} KPIs grouped by category
 */
export const groupKPIsByCategory = (kpis) => {
    return kpis.reduce((groups, kpi) => {
        const category = kpi.category || 'Uncategorized';
        if (!groups[category]) groups[category] = [];
        groups[category].push(kpi);
        return groups;
    }, {});
};

/**
 * Calculate performance summary
 * @param {Array} scores - Array of scores
 * @returns {Object} Performance summary
 */
export const calculatePerformanceSummary = (scores) => {
    if (!scores?.length) {
        return { avg: 0, min: 0, max: 0, green: 0, yellow: 0, red: 0 };
    }
    
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    const green = scores.filter(s => s >= 90).length;
    const yellow = scores.filter(s => s >= 50 && s < 90).length;
    const red = scores.filter(s => s < 50).length;
    
    return { avg, min, max, green, yellow, red };
};

/**
 * Generate CSV from data
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column definitions
 * @returns {string} CSV string
 */
export const generateCSV = (data, columns) => {
    if (!data?.length) return '';
    
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key];
            if (col.formatter) value = col.formatter(value);
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',');
    });
    
    return [headers, ...rows].join('\n');
};

/**
 * Download data as file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/csv') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, deepClone(value)]));
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract error message from API error
 * @param {Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
};