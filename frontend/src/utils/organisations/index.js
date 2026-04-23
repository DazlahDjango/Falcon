// Organisation Utils
// Utility functions for organisation-related operations

// Constants
export const ORGANISATION_CONSTANTS = {
  MAX_NAME_LENGTH: 100,
  MAX_SLUG_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_LOGO_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_CURRENCY: 'USD',
  MAX_MEMBERS: 1000,
  MAX_DEPARTMENTS: 50,
  MAX_TEAMS: 100,
  MAX_POSITIONS: 200,
};

// Formatters
export const formatters = {
  // Format organisation name for display
  organisationName: (name) => {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  },

  // Format currency values
  currency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  },

  // Format file sizes
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format dates for organisation context
  date: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },

  // Format member count
  memberCount: (count) => {
    if (count === 0) return 'No members';
    if (count === 1) return '1 member';
    return `${count} members`;
  },
};

// Validators
export const validators = {
  // Validate organisation name
  organisationName: (name) => {
    if (!name || typeof name !== 'string') return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.length > ORGANISATION_CONSTANTS.MAX_NAME_LENGTH) {
      return `Name must be less than ${ORGANISATION_CONSTANTS.MAX_NAME_LENGTH} characters`;
    }
    return null;
  },

  // Validate organisation slug
  organisationSlug: (slug) => {
    if (!slug || typeof slug !== 'string') return 'Slug is required';
    if (!/^[a-z0-9-]+$/.test(slug)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
    if (slug.length > ORGANISATION_CONSTANTS.MAX_SLUG_LENGTH) {
      return `Slug must be less than ${ORGANISATION_CONSTANTS.MAX_SLUG_LENGTH} characters`;
    }
    return null;
  },

  // Validate email domain
  emailDomain: (domain) => {
    if (!domain || typeof domain !== 'string') return 'Domain is required';
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) return 'Invalid domain format';
    return null;
  },

  // Validate logo file
  logoFile: (file) => {
    if (!file) return null;
    if (file.size > ORGANISATION_CONSTANTS.MAX_LOGO_SIZE) {
      return `Logo file size must be less than ${formatters.fileSize(ORGANISATION_CONSTANTS.MAX_LOGO_SIZE)}`;
    }
    if (!ORGANISATION_CONSTANTS.SUPPORTED_LOGO_TYPES.includes(file.type)) {
      return 'Logo must be a JPEG, PNG, or WebP image';
    }
    return null;
  },
};

// Helpers
export const helpers = {
  // Generate organisation slug from name
  generateSlug: (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Check if user has organisation permission
  hasPermission: (user, permission, organisation) => {
    if (!user || !organisation) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Client admin has organisation permissions
    if (user.role === 'client_admin' && user.organisation_id === organisation.id) {
      return true;
    }

    // Check specific permissions
    return user.permissions?.includes(permission) || false;
  },

  // Get organisation role display name
  getRoleDisplayName: (role) => {
    const roleNames = {
      super_admin: 'Super Administrator',
      client_admin: 'Organisation Administrator',
      dashboard_champion: 'Dashboard Champion',
      manager: 'Manager',
      staff: 'Staff',
    };
    return roleNames[role] || role;
  },

  // Calculate organisation storage usage
  calculateStorageUsage: (files) => {
    if (!Array.isArray(files)) return 0;
    return files.reduce((total, file) => total + (file.size || 0), 0);
  },

  // Get organisation status color
  getStatusColor: (status) => {
    const colors = {
      active: 'green',
      inactive: 'gray',
      suspended: 'red',
      pending: 'yellow',
    };
    return colors[status] || 'gray';
  },
};

export default {
  ORGANISATION_CONSTANTS,
  formatters,
  validators,
  helpers,
};