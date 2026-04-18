/**
 * Organisation Helpers
 * Utility helper functions for organisation operations
 */

import { ORGANISATION_STATUS, SECTOR_TYPES, USER_ROLES } from './constants';

// ============================================================
// Slug & URL Helpers
// ============================================================

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Generate a unique slug with counter
 * @param {string} baseSlug - The base slug
 * @param {Array} existingSlugs - Array of existing slugs
 * @returns {string} Unique slug
 */
export const generateUniqueSlug = (baseSlug, existingSlugs = []) => {
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// ============================================================
// Organisation Helpers
// ============================================================

/**
 * Check if organisation is active
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const isOrganisationActive = (organisation) => {
  return organisation?.status === ORGANISATION_STATUS.ACTIVE;
};

/**
 * Check if organisation is on trial
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const isOrganisationOnTrial = (organisation) => {
  return organisation?.status === ORGANISATION_STATUS.TRIAL;
};

/**
 * Check if organisation is suspended
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const isOrganisationSuspended = (organisation) => {
  return organisation?.status === ORGANISATION_STATUS.SUSPENDED;
};

/**
 * Check if organisation is pending approval
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const isOrganisationPending = (organisation) => {
  return organisation?.status === ORGANISATION_STATUS.PENDING;
};

// ============================================================
// Sector Helpers
// ============================================================

/**
 * Get sector icon
 * @param {string} sector - Sector type
 * @returns {string} Emoji icon
 */
export const getSectorIcon = (sector) => {
  const icons = {
    [SECTOR_TYPES.COMMERCIAL]: '🏢',
    [SECTOR_TYPES.NGO]: '🌍',
    [SECTOR_TYPES.PUBLIC]: '🏛️',
    [SECTOR_TYPES.CONSULTING]: '💼',
    [SECTOR_TYPES.EDUCATION]: '📚',
    [SECTOR_TYPES.HEALTHCARE]: '🏥',
    [SECTOR_TYPES.TECHNOLOGY]: '💻',
    [SECTOR_TYPES.MANUFACTURING]: '🏭',
    [SECTOR_TYPES.RETAIL]: '🛍️',
    [SECTOR_TYPES.OTHER]: '📋',
  };
  return icons[sector] || '🏢';
};

// ============================================================
// User Role Helpers
// ============================================================

/**
 * Check if user has admin role
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN;
};

/**
 * Check if user has manager role
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isManager = (user) => {
  return user?.role === USER_ROLES.MANAGER;
};

/**
 * Check if user is dashboard champion
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isDashboardChampion = (user) => {
  return user?.role === USER_ROLES.DASHBOARD_CHAMPION;
};

/**
 * Check if user can approve KPI submissions
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canApproveKPI = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can manage users
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

// ============================================================
// Array & Object Helpers
// ============================================================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
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

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {boolean} ascending - Sort ascending or descending
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (ascending) {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} keys - Keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, keys) => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

// ============================================================
// Tree Helpers
// ============================================================

/**
 * Build tree from flat array
 * @param {Array} items - Flat array with id and parentId
 * @param {string} idKey - ID key name
 * @param {string} parentKey - Parent ID key name
 * @returns {Array} Tree structure
 */
export const buildTree = (items, idKey = 'id', parentKey = 'parent') => {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item[idKey]] = { ...item, children: [] };
  });

  items.forEach(item => {
    const node = map[item[idKey]];
    if (item[parentKey] && map[item[parentKey]]) {
      map[item[parentKey]].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

/**
 * Flatten tree to array
 * @param {Array} tree - Tree structure
 * @returns {Array} Flat array
 */
export const flattenTree = (tree) => {
  const result = [];
  const traverse = (node) => {
    result.push({ ...node, children: undefined });
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  tree.forEach(traverse);
  return result;
};

/**
 * Find node in tree by ID
 * @param {Array} tree - Tree structure
 * @param {string} id - ID to find
 * @param {string} idKey - ID key name
 * @returns {Object|null} Found node
 */
export const findInTree = (tree, id, idKey = 'id') => {
  for (const node of tree) {
    if (node[idKey] === id) return node;
    if (node.children) {
      const found = findInTree(node.children, id, idKey);
      if (found) return found;
    }
  }
  return null;
};

// ============================================================
// Random Helpers
// ============================================================

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
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
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
};