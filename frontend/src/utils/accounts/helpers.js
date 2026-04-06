// Object Helpers
// ============================================================================

export const isEmpty = (obj) => {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string') return obj.trim() === '';
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
};

export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, deepClone(value)]));
};

export const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
    });
    return result;
};

export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
};

// ============================================================================
// Array Helpers
// ============================================================================

export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const unique = (array, key = null) => {
    if (!key) return [...new Set(array)];
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// ============================================================================
// URL Helpers
// ============================================================================

export const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
        }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
};

export const parseQueryString = (queryString) => {
    const params = {};
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
};

// ============================================================================
// Cookie Helpers
// ============================================================================

export const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

export const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

// ============================================================================
// Device Detection
// ============================================================================

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = () => {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
};

export const isDesktop = () => {
    return !isMobile() && !isTablet();
};

export const getDeviceType = () => {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
};

// ============================================================================
// Browser Detection
// ============================================================================

export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
    
    return browser;
};

// ============================================================================
// Color Helpers
// ============================================================================

export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
};

// ============================================================================
// Clipboard Helpers
// ============================================================================

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

// ============================================================================
// Scroll Helpers
// ============================================================================

export const scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
};

export const scrollToElement = (elementId, behavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior });
    }
};

// ============================================================================
// Download Helpers
// ============================================================================

export const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, filename);
};

export const downloadCsv = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, filename);
};

// ============================================================================
// Error Helpers
// ============================================================================

export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.error) return error.response.data.error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
};

// ============================================================================
// Class Name Helpers
// ============================================================================

export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// ============================================================================
// Delay Helper
// ============================================================================

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};