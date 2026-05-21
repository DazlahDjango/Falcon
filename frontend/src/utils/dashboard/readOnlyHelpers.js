// frontend/src/utils/dashboard/readOnlyHelpers.js

/**
 * Read-Only Helper Utilities
 * Masks sensitive data and disables edit actions
 */

/**
 * Mask sensitive data (e.g., exact financial figures)
 * @param {number} value - Original value
 * @param {boolean} shouldMask - Whether to mask
 * @returns {string} Masked or original value
 */
export const maskSensitiveData = (value, shouldMask = true) => {
  if (!shouldMask) return value;
  if (value === undefined || value === null) return '***';
  
  // Show ranges instead of exact figures
  if (typeof value === 'number') {
    if (value >= 1000000) return '> ₿1M';
    if (value >= 500000) return '₿500K-1M';
    if (value >= 100000) return '₿100K-500K';
    if (value >= 50000) return '₿50K-100K';
    if (value >= 10000) return '₿10K-50K';
    return '< ₿10K';
  }
  
  if (typeof value === 'string' && value.includes('@')) {
    // Mask email (show only domain)
    const parts = value.split('@');
    return `***@${parts[1]}`;
  }
  
  return '***';
};

/**
 * Remove edit actions from data
 * @param {Object} data - Original data
 * @returns {Object} Data without edit actions
 */
export const removeEditActions = (data) => {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Remove edit flags
  delete sanitized.can_edit;
  delete sanitized.can_submit;
  delete sanitized.can_approve;
  delete sanitized.can_configure;
  
  // Remove edit buttons from arrays
  if (Array.isArray(sanitized.kpis)) {
    sanitized.kpis = sanitized.kpis.map(kpi => ({
      ...kpi,
      can_edit: false,
      can_submit: false,
      actions: []
    }));
  }
  
  if (Array.isArray(sanitized.team_members)) {
    sanitized.team_members = sanitized.team_members.map(member => ({
      ...member,
      can_approve: false,
      actions: []
    }));
  }
  
  return sanitized;
};

/**
 * Check if user has read-only access
 * @param {Object} user - User object
 * @returns {boolean} Whether user is read-only
 */
export const isReadOnlyUser = (user) => {
  return user?.role === 'read_only';
};

/**
 * Get read-only view options
 * @returns {Array} View options for read-only dashboard
 */
export const getReadOnlyViewOptions = () => {
  return [
    { value: 'executive', label: 'Executive View', icon: '👔', description: 'Organization-wide metrics' },
    { value: 'manager', label: 'Manager View', icon: '👥', description: 'Team performance view' },
    { value: 'staff', label: 'Staff View', icon: '👤', description: 'Personal performance view' }
  ];
};

/**
 * Apply read-only transformations to dashboard data
 * @param {Object} data - Original dashboard data
 * @param {Object} options - Transformation options
 * @returns {Object} Transformed data
 */
export const applyReadOnlyTransformations = (data, options = {}) => {
  const { maskFinancials = true, hideEditButtons = true } = options;
  
  let transformed = { ...data };
  
  if (hideEditButtons) {
    transformed = removeEditActions(transformed);
  }
  
  if (maskFinancials && transformed.kpis) {
    transformed.kpis = transformed.kpis.map(kpi => ({
      ...kpi,
      actual: maskSensitiveData(kpi.actual, true),
      target: maskSensitiveData(kpi.target, true)
    }));
  }
  
  // Add read-only watermark flag
  transformed.is_read_only = true;
  
  return transformed;
};

export default {
  maskSensitiveData,
  removeEditActions,
  isReadOnlyUser,
  getReadOnlyViewOptions,
  applyReadOnlyTransformations
};