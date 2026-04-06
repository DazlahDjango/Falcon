// Date Formatters
// =================
export const formatDate = (date, format = 'MMM dd, yyyy') => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    if (format === 'full') {
        return d.toLocaleDateString('en-US', { ...options, weekday: 'long' });
    }
    if (format === 'time') {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (format === 'datetime') {
        return `${formatDate(d, 'short')} ${formatDate(d, 'time')}`;
    }
    if (format === 'iso') {
        return d.toISOString();
    }
    if (format === 'short') {
        return d.toLocaleDateString('en-US', options);
    }
    return d.toLocaleDateString('en-US', options);
};
export const formatDateTime = (date) => {
    return formatDate(date, 'datetime');
};
export const formatTimeAgo = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
};
export const formatRelativeTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 0) return formatDate(date);
    return formatTimeAgo(date);
};

// Number Formatters
// ====================
export const formatNumber = (value, decimals = 0, locale = 'en-US') => {
    if (value === undefined || value === null) return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
export const formatPercentage = (value, decimals = 0) => {
    if (value === undefined || value === null) return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';
    
    return `${formatNumber(num, decimals)}%`;
};

export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
    if (value === undefined || value === null) return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';
    
    return num.toLocaleString(locale, {
        style: 'currency',
        currency: currency
    });
};

export const formatCompactNumber = (value) => {
    if (value === undefined || value === null) return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';
    
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    
    return formatNumber(num);
};

// ============================================================================
// Text Formatters
// ============================================================================

export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncate = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
};

export const slugify = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const camelCase = (str) => {
    if (!str) return '';
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (_, c) => c.toLowerCase());
};

export const kebabCase = (str) => {
    if (!str) return '';
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
};

export const snakeCase = (str) => {
    if (!str) return '';
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
};

// ============================================================================
// Role Formatters
// ============================================================================

export const formatRole = (role) => {
    const roles = {
        super_admin: 'Super Admin',
        client_admin: 'Admin',
        executive: 'Executive',
        supervisor: 'Supervisor',
        dashboard_champion: 'Dashboard Champion',
        staff: 'Staff',
        read_only: 'Read Only'
    };
    return roles[role] || role;
};

export const formatRoleBadgeClass = (role) => {
    const classes = {
        super_admin: 'role-super-admin',
        client_admin: 'role-client-admin',
        executive: 'role-executive',
        supervisor: 'role-supervisor',
        dashboard_champion: 'role-dashboard-champion',
        staff: 'role-staff',
        read_only: 'role-read-only'
    };
    return classes[role] || 'role-staff';
};

// ============================================================================
// Status Formatters
// ============================================================================

export const formatStatus = (status) => {
    const statuses = {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        on_track: 'On Track',
        at_risk: 'At Risk',
        off_track: 'Off Track'
    };
    return statuses[status] || status;
};

export const formatStatusBadgeClass = (status) => {
    const classes = {
        active: 'status-active',
        inactive: 'status-inactive',
        pending: 'status-pending',
        approved: 'status-approved',
        rejected: 'status-rejected',
        on_track: 'status-on-track',
        at_risk: 'status-at-risk',
        off_track: 'status-off-track'
    };
    return classes[status] || 'status-default';
};

// ============================================================================
// File Size Formatter
// ============================================================================

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// Duration Formatter
// ============================================================================

export const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
};

// ============================================================================
// Phone Formatter
// ============================================================================

export const formatPhone = (phone) => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11) {
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
};