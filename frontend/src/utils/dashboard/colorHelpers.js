// frontend/src/utils/dashboard/colorHelpers.js
/**
 * Color utility functions for dashboard visualizations
 */

import { TRAFFIC_LIGHT_COLORS, TRAFFIC_LIGHT_BG_COLORS } from '../../config/constants/dashboardConstants';

/**
 * Get color for traffic light status
 * @param {string} status - Status (green, yellow, red)
 * @returns {string} CSS color
 */
export const getTrafficLightColor = (status) => {
  return TRAFFIC_LIGHT_COLORS[status?.toLowerCase()] || '#6b7280';
};

/**
 * Get background color for traffic light status
 * @param {string} status - Status (green, yellow, red)
 * @returns {string} CSS background color
 */
export const getTrafficLightBgColor = (status) => {
  return TRAFFIC_LIGHT_BG_COLORS[status?.toLowerCase()] || '#f3f4f6';
};

/**
 * Get color for score value
 * @param {number} score - Score (0-100)
 * @returns {string} CSS color
 */
export const getScoreColor = (score) => {
  if (score === null || score === undefined) return '#6b7280';
  if (score >= 90) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

/**
 * Get color for trend indicator
 * @param {string} trend - Trend (up, down, stable)
 * @returns {string} CSS color
 */
export const getTrendColor = (trend) => {
  const colors = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#6b7280'
  };
  return colors[trend] || '#6b7280';
};

/**
 * Generate random color with opacity
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color
 */
export const getRandomColor = (opacity = 1) => {
  const colors = [
    'rgba(59, 130, 246, {opacity})',   // Blue
    'rgba(16, 185, 129, {opacity})',   // Green
    'rgba(245, 158, 11, {opacity})',   // Yellow
    'rgba(239, 68, 68, {opacity})',    // Red
    'rgba(139, 92, 246, {opacity})',   // Purple
    'rgba(236, 72, 153, {opacity})',   // Pink
    'rgba(14, 165, 233, {opacity})'    // Sky
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return color.replace('{opacity}', opacity);
};

/**
 * Get consistent color for department
 * @param {string} departmentName - Department name
 * @returns {string} CSS color
 */
export const getDepartmentColor = (departmentName) => {
  const colors = {
    sales: '#3b82f6',
    marketing: '#f59e0b',
    engineering: '#10b981',
    finance: '#8b5cf6',
    hr: '#ec4899',
    operations: '#14b8a6',
    legal: '#6366f1',
    product: '#f97316'
  };
  
  const key = departmentName?.toLowerCase();
  return colors[key] || getRandomColor(0.7);
};

/**
 * Lighten or darken a color
 * @param {string} color - Hex color
 * @param {number} percent - Percent to lighten (positive) or darken (negative)
 * @returns {string} Modified hex color
 */
export const adjustColor = (color, percent) => {
  const clamp = (value) => Math.min(255, Math.max(0, value));
  
  let r, g, b;
  if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    return color;
  }
  
  r = clamp(r + (r * percent / 100));
  g = clamp(g + (g * percent / 100));
  b = clamp(b + (b * percent / 100));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Check if color is light (for text contrast)
 * @param {string} color - Hex color
 * @returns {boolean} True if color is light
 */
export const isLightColor = (color) => {
  let r, g, b;
  if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    return false;
  }
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

/**
 * Get contrasting text color (black or white)
 * @param {string} backgroundColor - Background color
 * @returns {string} '#ffffff' or '#000000'
 */
export const getContrastColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
};x