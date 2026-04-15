/**
 * Organisation Validators
 * Validation functions for organisation data
 */

// ============================================================
// Email & Phone Validators
// ============================================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
  return re.test(phone);
};

// ============================================================
// Domain & URL Validators
// ============================================================

/**
 * Validate domain name
 * @param {string} domain - Domain to validate
 * @returns {boolean} Is valid domain
 */
export const isValidDomain = (domain) => {
  const re = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return re.test(domain);
};

/**
 * Validate subdomain
 * @param {string} subdomain - Subdomain to validate
 * @returns {boolean} Is valid subdomain
 */
export const isValidSubdomain = (subdomain) => {
  const re = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return re.test(subdomain);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate slug
 * @param {string} slug - Slug to validate
 * @returns {boolean} Is valid slug
 */
export const isValidSlug = (slug) => {
  const re = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return re.test(slug);
};

// ============================================================
// Password Validators
// ============================================================

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    score: [
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length,
    errors: {
      minLength: !minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar,
    },
  };
};

/**
 * Check if passwords match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {boolean} Do passwords match
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// ============================================================
// Organisation Validators
// ============================================================

/**
 * Validate organisation name
 * @param {string} name - Organisation name
 * @returns {Object} Validation result
 */
export const validateOrganisationName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Organisation name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Organisation name must be at least 2 characters' };
  }
  if (name.length > 100) {
    return { isValid: false, error: 'Organisation name cannot exceed 100 characters' };
  }
  return { isValid: true, error: null };
};

/**
 * Validate organisation data
 * @param {Object} data - Organisation data
 * @returns {Object} Validation result with errors
 */
export const validateOrganisation = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Organisation name is required';
  if (!data.contact_email) errors.contact_email = 'Contact email is required';
  if (data.contact_email && !isValidEmail(data.contact_email)) errors.contact_email = 'Invalid email address';
  if (data.website && !isValidUrl(data.website)) errors.website = 'Invalid website URL';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Contact Validators
// ============================================================

/**
 * Validate contact data
 * @param {Object} data - Contact data
 * @returns {Object} Validation result with errors
 */
export const validateContact = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  if (data.email && !isValidEmail(data.email)) errors.email = 'Invalid email address';
  if (data.phone && !isValidPhone(data.phone)) errors.phone = 'Invalid phone number';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Department Validators
// ============================================================

/**
 * Validate department data
 * @param {Object} data - Department data
 * @returns {Object} Validation result with errors
 */
export const validateDepartment = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Department name is required';
  if (data.name && data.name.length > 100) errors.name = 'Department name cannot exceed 100 characters';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Team Validators
// ============================================================

/**
 * Validate team data
 * @param {Object} data - Team data
 * @returns {Object} Validation result with errors
 */
export const validateTeam = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Team name is required';
  if (!data.department) errors.department = 'Department is required';
  if (data.name && data.name.length > 100) errors.name = 'Team name cannot exceed 100 characters';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Position Validators
// ============================================================

/**
 * Validate position data
 * @param {Object} data - Position data
 * @returns {Object} Validation result with errors
 */
export const validatePosition = (data) => {
  const errors = {};
  
  if (!data.title) errors.title = 'Position title is required';
  if (!data.department) errors.department = 'Department is required';
  if (!data.level) errors.level = 'Hierarchy level is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Domain Validators
// ============================================================

/**
 * Validate domain data
 * @param {Object} data - Domain data
 * @returns {Object} Validation result with errors
 */
export const validateDomain = (data) => {
  const errors = {};
  
  if (!data.domain_name) errors.domain_name = 'Domain name is required';
  if (data.domain_name && !isValidDomain(data.domain_name)) {
    errors.domain_name = 'Invalid domain name format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// KPI Validators
// ============================================================

/**
 * Validate KPI data
 * @param {Object} data - KPI data
 * @returns {Object} Validation result with errors
 */
export const validateKPI = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'KPI name is required';
  if (!data.target_value) errors.target_value = 'Target value is required';
  if (data.target_value && isNaN(data.target_value)) errors.target_value = 'Target must be a number';
  if (data.weight && (data.weight < 0 || data.weight > 100)) errors.weight = 'Weight must be between 0 and 100';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================
// Form Validation Helpers
// ============================================================

/**
 * Validate form field
 * @param {string} value - Field value
 * @param {Object} rules - Validation rules
 * @returns {string|null} Error message or null
 */
export const validateField = (value, rules) => {
  if (rules.required && !value) {
    return rules.requiredMessage || 'This field is required';
  }
  
  if (rules.minLength && value && value.length < rules.minLength) {
    return rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
  }
  
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return rules.maxLengthMessage || `Cannot exceed ${rules.maxLength} characters`;
  }
  
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.patternMessage || 'Invalid format';
  }
  
  if (rules.type === 'email' && value && !isValidEmail(value)) {
    return 'Invalid email address';
  }
  
  if (rules.type === 'url' && value && !isValidUrl(value)) {
    return 'Invalid URL';
  }
  
  return null;
};