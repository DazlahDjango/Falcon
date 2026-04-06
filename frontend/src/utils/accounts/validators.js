import * as yup from 'yup';

// Email Validation
// ==================
export const isEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
};
export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!isEmail(email)) return 'Please enter a valid email address';
    return null;
};

// Password Validators
// ====================
export const isStrongPassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password);
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasNumber;
};
export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)) {
        return 'Password must contain at least one special character';
    }
    return null;
};
export const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
};
export const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)
    };
    
    Object.values(checks).forEach(passed => {
        if (passed) strength++;
    });
    
    if (strength <= 2) return { level: 'weak', text: 'Weak', score: strength };
    if (strength <= 3) return { level: 'fair', text: 'Fair', score: strength };
    if (strength <= 4) return { level: 'good', text: 'Good', score: strength };
    return { level: 'strong', text: 'Strong', score: strength };
};

// Username
// =========
export const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 50) return 'Username must be less than 50 characters';
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return 'Username can only contain letters, numbers, dots, underscores, and hyphens';
    }
    return null;
};

// Phone
// =======
export const validatePhone = (phone) => {
    if (!phone) return null;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid phone number';
    }
    return null;
};

// URL
// ========
export const isUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
export const validateUrl = (url) => {
    if (!url) return null;
    if (!isUrl(url)) return 'Please enter a valid URL';
    return null;
};

// Date 
// =====
export const isDate = (date) => {
    return !isNaN(new Date(date).getTime());
};
export const validateDate = (date, { required = false, min = null, max = null } = {}) => {
    if (!date) {
        if (required) return 'Date is required';
        return null;
    }
    if (!isDate(date)) return 'Please enter a valid date';
    const dateObj = new Date(date);
    const now = new Date();
    if (min && dateObj < new Date(min)) {
        return `Date must be after ${new Date(min).toLocaleDateString()}`;
    }
    if (max && dateObj > new Date(max)) {
        return `Date must be before ${new Date(max).toLocaleDateString()}`;
    }
    return null;
};

// Number
// ============
export const isNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};
export const validateNumber = (value, { required = false, min = null, max = null, integer = false } = {}) => {
    if (value === undefined || value === null || value === '') {
        if (required) return 'This field is required';
        return null;
    }
    const num = parseFloat(value);
    if (!isNumber(num)) return 'Please enter a valid number';
    if (integer && !Number.isInteger(num)) return 'Please enter a whole number';
    if (min !== null && num < min) return `Value must be at least ${min}`;
    if (max !== null && num > max) return `Value must be at most ${max}`;
    return null;
};

// Required fields
// ================
export const validateRequired = (value, fieldName = 'This field') => {
    if (value === undefined || value === null || value === '') {
        return `${fieldName} is required`;
    }
    if (typeof value === 'string' && !value.trim()) {
        return `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
        return `${fieldName} is required`;
    }
    return null;
};

// Yup Schemas
// ============
export const loginSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required')
});
export const registerSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
    firstName: yup.string(),
    lastName: yup.string()
});
export const passwordResetSchema = yup.object({
    newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Please confirm your password')
});
export const userCreateSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
    role: yup.string().required('Role is required'),
    firstName: yup.string(),
    lastName: yup.string()
});
export const userUpdateSchema = yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    role: yup.string(),
    is_active: yup.boolean()
});
export const roleCreateSchema = yup.object({
    name: yup.string().required('Role name is required'),
    code: yup.string().matches(/^[a-z_]+$/, 'Code must contain only lowercase letters and underscores').required('Role code is required'),
    description: yup.string()
});
export const tenantCreateSchema = yup.object({
    name: yup.string().required('Tenant name is required'),
    slug: yup.string().matches(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').required('Slug is required'),
    domain: yup.string().url('Invalid domain'),
    subscription_plan: yup.string().required('Subscription plan is required')
});

// Validation helpers
export const validateForm = async (schema, values) => {
    try {
        await schema.validate(values, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (err) {
        const errors = {};
        err.inner.forEach(error => {
            errors[error.path] = error.message;
        });
        return { isValid: false, errors };
    }
};
export const validateField = async (schema, field, value) => {
    try {
        await schema.validateAt(field, { [field]: value });
        return { isValid: true, error: null };
    } catch (err) {
        return { isValid: false, error: err.message };
    }
};