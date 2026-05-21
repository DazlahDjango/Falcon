// frontend/src/utils/dashboard/templateHelpers.js

/**
 * Template Helper Utilities for Champion Dashboard
 * Handles template cloning, validation, and management
 */

/**
 * Validate template data
 * @param {Object} template - Template object
 * @returns {Object} Validation result
 */
export const validateTemplate = (template) => {
  const errors = [];
  
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  }
  
  if (template.name && template.name.length > 100) {
    errors.push('Template name must be less than 100 characters');
  }
  
  if (template.category && !['sales', 'finance', 'hr', 'operations', 'marketing', 'custom'].includes(template.category)) {
    errors.push('Invalid template category');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Clone template data (deep copy)
 * @param {Object} template - Template to clone
 * @param {string} newName - New name for cloned template
 * @returns {Object} Cloned template
 */
export const cloneTemplate = (template, newName) => {
  return {
    ...JSON.parse(JSON.stringify(template)),
    id: null, // Will be assigned by backend
    name: newName || `${template.name} (Copy)`,
    created_at: new Date().toISOString(),
    usage_count: 0
  };
};

/**
 * Apply template to user configuration
 * @param {Object} template - Template configuration
 * @param {Object} userConfig - Current user configuration
 * @returns {Object} Merged configuration
 */
export const applyTemplateToUser = (template, userConfig = {}) => {
  return {
    ...userConfig,
    kpi_assignments: template.assigned_kpis || [],
    weights: template.weights || {},
    targets: template.targets || {},
    layout: template.layout || userConfig.layout,
    filters: template.filters || userConfig.filters
  };
};

/**
 * Get template category icon
 * @param {string} category - Template category
 * @returns {string} Emoji icon
 */
export const getTemplateCategoryIcon = (category) => {
  const icons = {
    sales: '📈',
    finance: '💰',
    hr: '👥',
    operations: '⚙️',
    marketing: '📢',
    custom: '📋'
  };
  return icons[category] || '📄';
};

/**
 * Get template category color
 * @param {string} category - Template category
 * @returns {string} CSS color
 */
export const getTemplateCategoryColor = (category) => {
  const colors = {
    sales: '#3b82f6',
    finance: '#10b981',
    hr: '#8b5cf6',
    operations: '#f59e0b',
    marketing: '#ec4899',
    custom: '#6b7280'
  };
  return colors[category] || '#6b7280';
};

/**
 * Filter templates by category and search
 * @param {Array} templates - List of templates
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered templates
 */
export const filterTemplates = (templates, filters = {}) => {
  let filtered = [...templates];
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(t => t.category === filters.category);
  }
  
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.name?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  }
  
  return filtered;
};

/**
 * Sort templates by field
 * @param {Array} templates - List of templates
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted templates
 */
export const sortTemplates = (templates, sortBy = 'name', sortOrder = 'asc') => {
  const sorted = [...templates];
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'usage_count') {
      aVal = a.usage_count || 0;
      bVal = b.usage_count || 0;
    }
    
    if (sortBy === 'created_at') {
      aVal = new Date(a.created_at);
      bVal = new Date(b.created_at);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  return sorted;
};

export default {
  validateTemplate,
  cloneTemplate,
  applyTemplateToUser,
  getTemplateCategoryIcon,
  getTemplateCategoryColor,
  filterTemplates,
  sortTemplates
};