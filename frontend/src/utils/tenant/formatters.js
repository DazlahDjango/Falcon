// frontend/src/utils/tenant/formatters.js

/**
 * Format bytes to human readable file size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return 'N/A';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format megabytes to human readable string
 * @param {number} mb - Size in megabytes
 * @returns {string} Formatted size (e.g., "1.5 GB")
 */
export const formatStorageSize = (mb) => {
    if (!mb && mb !== 0) return 'N/A';
    if (mb < 1024) return `${mb} MB`;
    if (mb < 1024 * 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${(mb / (1024 * 1024)).toFixed(1)} TB`;
};

/**
 * Format percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage (e.g., "75.5%")
 */
export const formatPercentage = (value, total, decimals = 1) => {
    if (!total || total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
};

/**
 * Format date to local string
 * @param {string|Date} date - Date to format
 * @param {string} format - Desired format (default: 'MMM DD, YYYY')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return format
        .replace('MMM', month)
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * Format date and time together
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
    return formatDate(date, 'MMM DD, YYYY HH:mm:ss');
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';

    const d = new Date(date);
    const now = new Date();
    const diffSeconds = Math.floor((now - d) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
    if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)} weeks ago`;
    if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)} months ago`;
    return `${Math.floor(diffSeconds / 31536000)} years ago`;
};

/**
 * Format duration in seconds to human readable
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2m 30s")
 */
export const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

/**
 * Format subscription plan name
 * @param {string} plan - Plan key (trial, basic, professional, enterprise)
 * @returns {string} Formatted plan name
 */
export const formatPlanName = (plan) => {
    const plans = {
        trial: 'Trial',
        basic: 'Basic',
        professional: 'Professional',
        enterprise: 'Enterprise',
    };
    return plans[plan] || plan || 'Unknown';
};

/**
 * Format tenant status for display
 * @param {string} status - Status key
 * @returns {string} Formatted status
 */
export const formatTenantStatus = (status) => {
    const statuses = {
        provisioning: 'Provisioning',
        active: 'Active',
        suspended: 'Suspended',
        maintenance: 'Maintenance',
        deleted: 'Deleted',
        failed: 'Failed',
    };
    return statuses[status] || status || 'Unknown';
};

/**
 * Format domain status for display
 * @param {string} status - Domain status key
 * @returns {string} Formatted status
 */
export const formatDomainStatus = (status) => {
    const statuses = {
        pending: 'Pending Verification',
        verifying: 'Verifying',
        active: 'Active',
        failed: 'Failed',
        expired: 'Expired',
        removed: 'Removed',
    };
    return statuses[status] || status || 'Unknown';
};

/**
 * Format backup type for display
 * @param {string} type - Backup type key
 * @returns {string} Formatted backup type
 */
export const formatBackupType = (type) => {
    const types = {
        full: 'Full Backup',
        schema: 'Schema Only',
        data: 'Data Only',
        incremental: 'Incremental',
    };
    return types[type] || type || 'Unknown';
};

/**
 * Format backup status for display
 * @param {string} status - Backup status key
 * @returns {string} Formatted status
 */
export const formatBackupStatus = (status) => {
    const statuses = {
        pending: 'Pending',
        running: 'Running',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled',
    };
    return statuses[status] || status || 'Unknown';
};

/**
 * Format resource type for display
 * @param {string} type - Resource type key
 * @returns {string} Formatted resource type
 */
export const formatResourceType = (type) => {
    const types = {
        users: 'Users',
        storage_mb: 'Storage',
        api_calls_per_day: 'API Calls',
        kpis: 'KPIs',
        departments: 'Departments',
        concurrent_sessions: 'Concurrent Sessions',
    };
    return types[type] || type || 'Unknown';
};

/**
 * Format SSL expiry warning
 * @param {string|Date} expiryDate - SSL expiry date
 * @returns {object} { text, color, isExpiringSoon }
 */
export const formatSSLStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'No SSL', color: 'default', isExpiringSoon: false };

    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return { text: 'Expired', color: 'error', isExpiringSoon: true };
    if (daysRemaining < 7) return { text: `Expires in ${daysRemaining} days`, color: 'error', isExpiringSoon: true };
    if (daysRemaining < 30) return { text: `Expires in ${daysRemaining} days`, color: 'warning', isExpiringSoon: true };
    return { text: `Expires in ${daysRemaining} days`, color: 'success', isExpiringSoon: false };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Get status color for UI components
 * @param {string} status - Status key
 * @param {string} type - Type of status (tenant, domain, backup)
 * @returns {string} Color name (success, error, warning, info, default)
 */
export const getStatusColor = (status, type = 'tenant') => {
    const colors = {
        tenant: {
            provisioning: 'warning',
            active: 'success',
            suspended: 'error',
            maintenance: 'info',
            deleted: 'default',
            failed: 'error',
        },
        domain: {
            pending: 'warning',
            verifying: 'info',
            active: 'success',
            failed: 'error',
            expired: 'default',
            removed: 'default',
        },
        backup: {
            pending: 'warning',
            running: 'info',
            completed: 'success',
            failed: 'error',
            cancelled: 'default',
        },
    };

    return colors[type]?.[status] || 'default';
};