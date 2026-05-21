// frontend/src/utils/dashboard/kpiSubmissionHelpers.js

/**
 * KPI Submission Helper Utilities for Staff Dashboard
 * Validates submissions and calculates progress
 */

/**
 * Validate KPI submission value
 * @param {number} value - Submitted value
 * @param {Object} kpi - KPI object with target and type
 * @returns {Object} Validation result
 */
export const validateSubmission = (value, kpi) => {
  const errors = [];
  
  if (value === undefined || value === null) {
    errors.push('Value is required');
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push('Value must be a number');
  }
  
  if (value < 0) {
    errors.push('Value cannot be negative');
  }
  
  // Check against target (if it's a maximum)
  if (kpi.target_type === 'maximum' && value > kpi.target) {
    errors.push(`Value cannot exceed target of ${kpi.target}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate remaining target
 * @param {number} currentValue - Current actual value
 * @param {number} target - Target value
 * @returns {number} Remaining target
 */
export const calculateRemainingTarget = (currentValue, target) => {
  if (!currentValue || !target) return target;
  return Math.max(0, target - currentValue);
};

/**
 * Calculate progress percentage
 * @param {number} currentValue - Current actual value
 * @param {number} target - Target value
 * @returns {number} Progress percentage
 */
export const calculateProgress = (currentValue, target) => {
  if (!currentValue || !target) return 0;
  return Math.min(100, (currentValue / target) * 100);
};

/**
 * Get submission status badge info
 * @param {string} status - Submission status
 * @returns {Object} Badge info (color, icon, text)
 */
export const getSubmissionStatusInfo = (status) => {
  const statusMap = {
    pending: { color: '#f59e0b', icon: '⏳', text: 'Pending Approval' },
    approved: { color: '#10b981', icon: '✅', text: 'Approved' },
    rejected: { color: '#ef4444', icon: '❌', text: 'Rejected' },
    submitted: { color: '#3b82f6', icon: '📤', text: 'Submitted' },
    not_submitted: { color: '#9ca3af', icon: '📝', text: 'Not Submitted' }
  };
  
  return statusMap[status] || statusMap.not_submitted;
};

/**
 * Format submission date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatSubmissionDate = (dateString) => {
  if (!dateString) return 'Not submitted';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
};

/**
 * Calculate trend between periods
 * @param {number} currentScore - Current period score
 * @param {number} previousScore - Previous period score
 * @returns {Object} Trend info
 */
export const calculateScoreTrend = (currentScore, previousScore) => {
  if (!currentScore || !previousScore) {
    return { direction: 'stable', change: 0, icon: '➡️', color: '#6b7280' };
  }
  
  const change = ((currentScore - previousScore) / previousScore) * 100;
  
  if (change > 5) {
    return { direction: 'up', change, icon: '📈', color: '#10b981' };
  }
  if (change < -5) {
    return { direction: 'down', change, icon: '📉', color: '#ef4444' };
  }
  return { direction: 'stable', change, icon: '➡️', color: '#f59e0b' };
};

export default {
  validateSubmission,
  calculateRemainingTarget,
  calculateProgress,
  getSubmissionStatusInfo,
  formatSubmissionDate,
  calculateScoreTrend
};