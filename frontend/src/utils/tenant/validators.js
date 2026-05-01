// frontend/src/utils/tenant/validators.js

/**
 * Validate tenant name
 * @param {string} name - Tenant name to validate
 * @returns {object} { isValid, error }
 */
export const validateTenantName = (name) => {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Tenant name is required' };
    }

    if (name.length < 2) {
        return { isValid: false, error: 'Tenant name must be at least 2 characters' };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Tenant name cannot exceed 100 characters' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate tenant slug (URL identifier)
 * @param {string} slug - Slug to validate
 * @returns {object} { isValid, error }
 */
export const validateTenantSlug = (slug) => {
    if (!slug || slug.trim() === '') {
        return { isValid: false, error: 'Slug is required' };
    }

    if (slug.length < 3) {
        return { isValid: false, error: 'Slug must be at least 3 characters' };
    }

    if (slug.length > 50) {
        return { isValid: false, error: 'Slug cannot exceed 50 characters' };
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
        return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate domain name
 * @param {string} domain - Domain to validate (e.g., example.com)
 * @returns {object} { isValid, error }
 */
export const validateDomain = (domain) => {
    if (!domain || domain.trim() === '') {
        return { isValid: false, error: 'Domain is required' };
    }

    if (domain.length > 255) {
        return { isValid: false, error: 'Domain cannot exceed 255 characters' };
    }

    // Check if domain has valid format
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return { isValid: false, error: 'Please enter a valid domain name (e.g., example.com)' };
    }

    // Check for reserved domains
    const reservedDomains = ['localhost', 'falcon.com', 'app.falcon.com', 'api.falcon.com'];
    if (reservedDomains.includes(domain.toLowerCase())) {
        return { isValid: false, error: 'This domain is reserved and cannot be used' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} { isValid, error }
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (email.length > 254) {
        return { isValid: false, error: 'Email cannot exceed 254 characters' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid, error }
 */
export const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
        return { isValid: true, error: null }; // Phone is optional
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Please enter a valid phone number' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate subscription plan
 * @param {string} plan - Plan to validate
 * @returns {object} { isValid, error }
 */
export const validateSubscriptionPlan = (plan) => {
    const validPlans = ['trial', 'basic', 'professional', 'enterprise'];

    if (!plan) {
        return { isValid: false, error: 'Subscription plan is required' };
    }

    if (!validPlans.includes(plan)) {
        return { isValid: false, error: 'Invalid subscription plan' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate resource limit value
 * @param {number} limit - Limit value to validate
 * @param {string} resourceType - Type of resource
 * @returns {object} { isValid, error }
 */
export const validateResourceLimit = (limit, resourceType) => {
    const numLimit = Number(limit);

    if (isNaN(numLimit)) {
        return { isValid: false, error: 'Limit must be a number' };
    }

    if (numLimit < 1) {
        return { isValid: false, error: 'Limit must be at least 1' };
    }

    // Max limits per resource type
    const maxLimits = {
        users: 100000,
        storage_mb: 10485760, // 10TB
        api_calls_per_day: 10000000,
        kpis: 100000,
        departments: 10000,
        concurrent_sessions: 1000,
    };

    const maxLimit = maxLimits[resourceType] || 999999;
    if (numLimit > maxLimit) {
        return { isValid: false, error: `Limit cannot exceed ${maxLimit.toLocaleString()}` };
    }

    return { isValid: true, error: null };
};

/**
 * Validate backup retention days
 * @param {number} days - Retention days to validate
 * @returns {object} { isValid, error }
 */
export const validateRetentionDays = (days) => {
    const numDays = Number(days);

    if (isNaN(numDays)) {
        return { isValid: false, error: 'Retention days must be a number' };
    }

    if (numDays < 1) {
        return { isValid: false, error: 'Retention days must be at least 1' };
    }

    if (numDays > 365) {
        return { isValid: false, error: 'Retention days cannot exceed 365' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate color hex code
 * @param {string} color - Color hex code (e.g., #1a56db)
 * @returns {object} { isValid, error }
 */
export const validateColorHex = (color) => {
    if (!color) {
        return { isValid: true, error: null }; // Color is optional
    }

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(color)) {
        return { isValid: false, error: 'Please enter a valid hex color code (e.g., #1a56db)' };
    }

    return { isValid: true, error: null };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {object} { isValid, error }
 */
export const validateUrl = (url) => {
    if (!url) {
        return { isValid: true, error: null }; // URL is optional
    }

    try {
        new URL(url);
        return { isValid: true, error: null };
    } catch {
        return { isValid: false, error: 'Please enter a valid URL' };
    }
};

/**
 * Validate form data for tenant creation
 * @param {object} data - Form data object
 * @returns {object} { isValid, errors }
 */
export const validateTenantForm = (data) => {
    const errors = {};

    const nameValidation = validateTenantName(data.name);
    if (!nameValidation.isValid) errors.name = nameValidation.error;

    const slugValidation = validateTenantSlug(data.slug);
    if (!slugValidation.isValid) errors.slug = slugValidation.error;

    const emailValidation = validateEmail(data.contact_email);
    if (!emailValidation.isValid) errors.contact_email = emailValidation.error;

    if (data.domain) {
        const domainValidation = validateDomain(data.domain);
        if (!domainValidation.isValid) errors.domain = domainValidation.error;
    }

    if (data.contact_phone) {
        const phoneValidation = validatePhone(data.contact_phone);
        if (!phoneValidation.isValid) errors.contact_phone = phoneValidation.error;
    }

    if (data.primary_color) {
        const colorValidation = validateColorHex(data.primary_color);
        if (!colorValidation.isValid) errors.primary_color = colorValidation.error;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate domain form data
 * @param {object} data - Domain form data
 * @returns {object} { isValid, errors }
 */
export const validateDomainForm = (data) => {
    const errors = {};

    const domainValidation = validateDomain(data.domain);
    if (!domainValidation.isValid) errors.domain = domainValidation.error;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate backup creation form
 * @param {object} data - Backup form data
 * @returns {object} { isValid, errors }
 */
export const validateBackupForm = (data) => {
    const errors = {};

    const validTypes = ['full', 'schema', 'data', 'incremental'];
    if (!data.backup_type || !validTypes.includes(data.backup_type)) {
        errors.backup_type = 'Please select a valid backup type';
    }

    if (data.retention_days) {
        const retentionValidation = validateRetentionDays(data.retention_days);
        if (!retentionValidation.isValid) errors.retention_days = retentionValidation.error;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};