import { TRAFFIC_LIGHT, PRECISION, DATE_FORMATS } from './constants';

export const formatScore = (score, decimals = PRECISION.SCORE) => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    return `${score.toFixed(decimals)}%`;
};
export const formatCurrency = (value, currency = 'KES', decimals = PRECISION.CURRENCY) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};
export const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};
export const formatPercentage = (value, decimals = PRECISION.PERCENTAGE) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `${value.toFixed(decimals)}%`;
};
export const formatTrafficLight = (status, withEmoji = true) => {
    const config = TRAFFIC_LIGHT[status];
    if (!config) return 'Unknown';
    if (withEmoji) return `${config.emoji} ${config.label}`;
    return config.label;
};
export const getTrafficLightColor = (status) => {
    return TRAFFIC_LIGHT[status]?.color || '#6b7280';
};
export const getTrafficLightFromScore = (score) => {
    if (score >= TRAFFIC_LIGHT.GREEN.threshold) return TRAFFIC_LIGHT.GREEN;
    if (score >= TRAFFIC_LIGHT.YELLOW.threshold) return TRAFFIC_LIGHT.YELLOW;
    return TRAFFIC_LIGHT.RED;
};

export const formatValidationStatus = (status) => {
    return VALIDATION_STATUS[status] || { label: status, color: '#6b7280', icon: '📝' };
};
export const formatKPIType = (type) => {
    return KPI_TYPES[type]?.label || type;
};

export const formatCalculationLogic = (logic) => {
    return CALCULATION_LOGIC[logic]?.label || logic;
};

export const formatMeasureType = (type) => {
    return MEASURE_TYPES[type]?.label || type;
};
export const formatMetricValue = (value, unit = '', type = null, decimals = PRECISION.DEFAULT) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    let formatted = value.toFixed(decimals);
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    if (type === 'PERCENTAGE') return `${formatted}%`;
    if (type === 'FINANCIAL') return formatCurrency(value);
    if (unit) return `${formatted} ${unit}`;
    return formatted;
};
export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0s';
    
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
        const minutes = seconds / 60;
        return `${minutes.toFixed(1)}m`;
    } else {
        const hours = seconds / 3600;
        return `${hours.toFixed(1)}h`;
    }
};
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
};
export const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
export const formatTrend = (direction) => {
    const trends = {
        IMPROVING: { icon: '📈', label: 'Improving', color: '#22c55e' },
        DECLINING: { icon: '📉', label: 'Declining', color: '#ef4444' },
        STABLE: { icon: '➡️', label: 'Stable', color: '#6b7280' },
        VOLATILE: { icon: '↗↘', label: 'Volatile', color: '#eab308' }
    };
    return trends[direction] || { icon: '📊', label: 'Unknown', color: '#6b7280' };
};