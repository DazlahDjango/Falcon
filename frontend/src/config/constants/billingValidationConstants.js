// ============================================================================
// Payment Validation Rules
// ============================================================================

export const PAYMENT_VALIDATION = {
    CARD_NUMBER: {
        pattern: /^\d{16}$/,
        message: 'Card number must be 16 digits',
        maxLength: 16,
        minLength: 16,
    },
    CVV: {
        pattern: /^\d{3,4}$/,
        message: 'CVV must be 3 or 4 digits',
        maxLength: 4,
        minLength: 3,
    },
    EXPIRY_DATE: {
        pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
        message: 'Use format MM/YY',
        monthRange: { min: 1, max: 12 },
        yearRange: { min: 2024, max: 2034 },
    },
    PHONE_NUMBER: {
        pattern: /^(07\d{8}|2547\d{8}|\+2547\d{8})$/,
        message: 'Enter valid Kenyan phone number (07XXXXXXXXX or +254XXXXXXXXX)',
    },
    AMOUNT: {
        min: 1,
        max: 10000000, // 100,000 KES
        message: 'Amount must be between 1 and 10,000,000',
    },
};

// ============================================================================
// Address Validation Rules
// ============================================================================

export const ADDRESS_VALIDATION = {
    STREET: {
        minLength: 3,
        maxLength: 200,
        required: false,
    },
    CITY: {
        minLength: 2,
        maxLength: 100,
        required: true,
    },
    STATE: {
        minLength: 2,
        maxLength: 100,
        required: false,
    },
    POSTAL_CODE: {
        pattern: /^\d{5}$/,
        message: 'Postal code must be 5 digits',
        required: false,
    },
    COUNTRY: {
        required: true,
        default: 'KE',
    },
};

// ============================================================================
// Billing Form Field Limits
// ============================================================================

export const BILLING_FORM_LIMITS = {
    COMPANY_NAME: {
        minLength: 2,
        maxLength: 200,
    },
    TAX_ID: {
        pattern: /^[A-Z0-9-]{5,20}$/,
        message: 'Invalid tax ID format',
        maxLength: 20,
    },
    REFERENCE: {
        maxLength: 100,
        pattern: /^[A-Za-z0-9_-]+$/,
        message: 'Reference can only contain letters, numbers, hyphens, and underscores',
    },
    DESCRIPTION: {
        maxLength: 500,
        required: false,
    },
    REASON: {
        maxLength: 500,
        required: false,
    },
};

// ============================================================================
// Rate Limit Constants
// ============================================================================

export const RATE_LIMITS = {
    CHECKOUT: {
        max: 10,
        window: 3600, // 1 hour in seconds
        message: 'Too many checkout attempts. Please try again later.',
    },
    PAYMENT_INITIATION: {
        max: 5,
        window: 60, // 1 minute
        message: 'Too many payment attempts. Please wait a moment.',
    },
    SUBSCRIPTION_CHANGE: {
        max: 3,
        window: 3600, // 1 hour
        message: 'Too many subscription changes. Please try again later.',
    },
    INVOICE_DOWNLOAD: {
        max: 30,
        window: 60, // 1 minute
        message: 'Too many download requests. Please wait.',
    },
    WEBHOOK_RETRY: {
        max: 10,
        window: 3600, // 1 hour
        message: 'Too many retry attempts. Please contact support.',
    },
};

// ============================================================================
// File Upload Limits
// ============================================================================

export const UPLOAD_LIMITS = {
    INVOICE_PDF: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf'],
        maxFiles: 1,
    },
    PAYMENT_PROOF: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        maxFiles: 5,
    },
};

// ============================================================================
// Validation Messages
// ============================================================================

export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_AMOUNT: 'Please enter a valid amount',
    INVALID_CARD: 'Please enter a valid card number',
    INVALID_CVV: 'Please enter a valid CVV',
    INVALID_EXPIRY: 'Please enter a valid expiry date (MM/YY)',
    CARD_EXPIRED: 'This card has expired',
    INSUFFICIENT_FUNDS: 'Insufficient funds',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    SUBSCRIPTION_ACTIVE: 'You already have an active subscription',
    SUBSCRIPTION_EXPIRED: 'Your subscription has expired',
    INVOICE_OVERDUE: 'This invoice is overdue',
    PLAN_NOT_AVAILABLE: 'This plan is no longer available',
    PAYMENT_METHOD_EXISTS: 'This payment method already exists',
    NO_DEFAULT_PAYMENT_METHOD: 'Please add a payment method',
};

// ============================================================================
// Export all validation constants
// ============================================================================

export default {
    PAYMENT_VALIDATION,
    ADDRESS_VALIDATION,
    BILLING_FORM_LIMITS,
    RATE_LIMITS,
    UPLOAD_LIMITS,
    VALIDATION_MESSAGES,
};