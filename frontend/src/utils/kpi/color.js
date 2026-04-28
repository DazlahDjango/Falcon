/**
 * Color Utilities
 * Functions for color manipulation
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {Object} RGB object with r, g, b values
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code
 */
export const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Lighten a color
 * @param {string} color - Hex color code
 * @param {number} percent - Lighten percentage (0-100)
 * @returns {string} Lightened color
 */
export const lightenColor = (color, percent) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const lighten = (value) => {
        return Math.min(255, Math.floor(value + (255 - value) * (percent / 100)));
    };
    
    return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
};

/**
 * Darken a color
 * @param {string} color - Hex color code
 * @param {number} percent - Darken percentage (0-100)
 * @returns {string} Darkened color
 */
export const darkenColor = (color, percent) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const darken = (value) => {
        return Math.max(0, Math.floor(value * (1 - percent / 100)));
    };
    
    return rgbToHex(darken(rgb.r), darken(rgb.g), darken(rgb.b));
};

/**
 * Get contrast color (black or white) for background
 * @param {string} backgroundColor - Background color in hex
 * @returns {string} Black or white color
 */
export const getContrastColor = (backgroundColor) => {
    const rgb = hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Generate random color
 * @param {number} saturation - Saturation (0-100)
 * @param {number} lightness - Lightness (0-100)
 * @returns {string} HSL color string
 */
export const getRandomColor = (saturation = 70, lightness = 50) => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get color for score
 * @param {number} score - Score value (0-100)
 * @returns {string} Color code
 */
export const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#eab308';
    return '#ef4444';
};

/**
 * Get gradient colors for chart
 * @param {string} startColor - Start color
 * @param {string} endColor - End color
 * @returns {Object} Gradient configuration
 */
export const getGradientColors = (startColor, endColor) => {
    return {
        start: startColor,
        end: endColor,
        css: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`
    };
};

/**
 * Traffic light colors
 */
export const TRAFFIC_LIGHT_COLORS = {
    GREEN: '#22c55e',
    YELLOW: '#eab308',
    RED: '#ef4444',
    GREEN_LIGHT: '#86efac',
    YELLOW_LIGHT: '#fde047',
    RED_LIGHT: '#f87171',
    GREEN_DARK: '#15803d',
    YELLOW_DARK: '#a16207',
    RED_DARK: '#b91c1c',
};

/**
 * Status colors
 */
export const STATUS_COLORS = {
    SUCCESS: '#22c55e',
    WARNING: '#eab308',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
    PENDING: '#eab308',
    APPROVED: '#22c55e',
    REJECTED: '#ef4444',
    ACTIVE: '#22c55e',
    INACTIVE: '#6b7280',
};