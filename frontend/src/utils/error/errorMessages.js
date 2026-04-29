import { ERROR_MESSAGES } from '../kpi/constants';

/**
 * Validation error messages
 */
export const validationMessages = {
    required: 'This field is required',
    minLength: (min) => `Must be at least ${min} characters`,
    maxLength: (max) => `Must be at most ${max} characters`,
    min: (min) => `Value must be at least ${min}`,
    max: (max) => `Value must be at most ${max}`,
    email: 'Please enter a valid email address',
    pattern: 'Invalid format',
    match: (field) => `Does not match ${field}`,
    unique: 'This value already exists'
};

/**
 * KPI error messages
 */
export const kpiErrorMessages = {
    duplicateCode: 'A KPI with this code already exists',
    invalidType: 'Invalid KPI type',
    invalidLogic: 'Invalid calculation logic',
    invalidMeasure: 'Invalid measure type',
    frameworkNotFound: 'Framework not found',
    sectorNotFound: 'Sector not found',
    categoryNotFound: 'Category not found',
    ownerNotFound: 'Owner not found',
    departmentNotFound: 'Department not found',
    inactiveKPI: 'This KPI is inactive',
    invalidTargetRange: 'Target range is invalid',
    weightSumError: 'Weights must sum to 100%'
};

/**
 * Target error messages
 */
export const targetErrorMessages = {
    invalidYear: 'Invalid year',
    invalidValue: 'Target value must be positive',
    alreadyExists: 'Target already exists for this period',
    phasingLocked: 'Phasing is locked and cannot be modified',
    invalidPhasing: 'Invalid phasing configuration',
    cascadeError: 'Target cascade failed',
    cascadeSumError: 'Cascaded targets must sum to parent target'
};

/**
 * Actual error messages
 */
export const actualErrorMessages = {
    invalidPeriod: 'Invalid period',
    invalidValue: 'Actual value must be non-negative',
    alreadyExists: 'Data already submitted for this period',
    notSubmitted: 'Data not submitted yet',
    alreadyValidated: 'Data already validated',
    pendingValidation: 'Data pending validation',
    adjustmentPending: 'Adjustment request already pending',
    noEvidence: 'Evidence required for this KPI'
};

/**
 * Score error messages
 */
export const scoreErrorMessages = {
    calculationFailed: 'Score calculation failed',
    noTarget: 'No target found for this period',
    noActual: 'No actual data found for this period',
    invalidFormula: 'Invalid calculation formula',
    aggregationFailed: 'Score aggregation failed'
};

/**
 * Auth error messages
 */
export const authErrorMessages = {
    invalidCredentials: 'Invalid email or password',
    accountLocked: 'Account locked. Too many failed attempts',
    emailNotVerified: 'Please verify your email address',
    passwordResetFailed: 'Password reset failed',
    tokenExpired: 'Session expired. Please login again',
    unauthorized: 'You are not authorized to perform this action'
};

/**
 * Network error messages
 */
export const networkErrorMessages = {
    offline: 'You are offline. Please check your connection',
    timeout: 'Request timeout. Please try again',
    serverDown: 'Server is unavailable. Please try again later',
    cors: 'Network error. Please contact support'
};

/**
 * Get error message by type and key
 * @param {string} category - Error category
 * @param {string} key - Error key
 * @param {Object} params - Error parameters
 * @returns {string} Error message
 */
export const getErrorMessage = (category, key, params = {}) => {
    const messages = {
        validation: validationMessages,
        kpi: kpiErrorMessages,
        target: targetErrorMessages,
        actual: actualErrorMessages,
        score: scoreErrorMessages,
        auth: authErrorMessages,
        network: networkErrorMessages
    };
    
    const categoryMessages = messages[category] || messages.validation;
    const message = categoryMessages[key];
    
    if (typeof message === 'function') {
        return message(params);
    }
    
    return message || ERROR_MESSAGES.SERVER;
};