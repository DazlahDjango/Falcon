/**
 * Billing Error Handlers
 * Error handling utilities for billing operations
 */

/**
 * Error codes and their user-friendly messages
 */
export const ERROR_MESSAGES = {
    // Payment errors
    PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
    PAYMENT_DECLINED: 'Your payment was declined. Please check your card details or contact your bank.',
    INSUFFICIENT_FUNDS: 'Insufficient funds. Please use a different payment method.',
    EXPIRED_CARD: 'Your card has expired. Please update your payment method.',
    INVALID_CARD: 'Invalid card details. Please check and try again.',
    
    // Subscription errors
    SUBSCRIPTION_NOT_FOUND: 'Subscription not found.',
    SUBSCRIPTION_ACTIVE: 'You already have an active subscription.',
    SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
    CANT_UPGRADE: 'Unable to upgrade plan. Please contact support.',
    CANT_DOWNGRADE: 'Unable to downgrade plan. Please contact support.',
    
    // Invoice errors
    INVOICE_NOT_FOUND: 'Invoice not found.',
    INVOICE_ALREADY_PAID: 'This invoice has already been paid.',
    INVOICE_OVERDUE: 'This invoice is overdue. Please pay immediately.',
    
    // General errors
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 * @param {Error|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
    if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
    
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check for specific error patterns
    if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
        return ERROR_MESSAGES.INSUFFICIENT_FUNDS;
    }
    if (errorMessage.includes('declined')) {
        return ERROR_MESSAGES.PAYMENT_DECLINED;
    }
    if (errorMessage.includes('expired')) {
        return ERROR_MESSAGES.EXPIRED_CARD;
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (errorMessage.includes('429') || errorMessage.includes('rate')) {
        return ERROR_MESSAGES.RATE_LIMIT;
    }
    if (errorMessage.includes('500') || errorMessage.includes('server')) {
        return ERROR_MESSAGES.SERVER_ERROR;
    }
    
    // Check for specific error codes in response
    if (error.response?.data?.code) {
        const code = error.response.data.code;
        if (ERROR_MESSAGES[code]) {
            return ERROR_MESSAGES[code];
        }
    }
    
    // Return the original message or default
    return errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Log billing error for debugging
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 * @param {Object} metadata - Additional metadata
 */
export const logBillingError = (error, context, metadata = {}) => {
    console.error(`[Billing Error] ${context}:`, {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        ...metadata,
        timestamp: new Date().toISOString(),
    });
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production' && window.Sentry) {
        window.Sentry.captureException(error, {
            tags: { context },
            extra: metadata,
        });
    }
};

/**
 * Handle billing error with user feedback
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 * @param {Function} showToast - Toast notification function
 * @returns {string} User-friendly error message
 */
export const handleBillingError = (error, context, showToast) => {
    const userMessage = getUserFriendlyErrorMessage(error);
    logBillingError(error, context, { userMessage });
    
    if (showToast) {
        showToast({
            message: userMessage,
            type: 'error',
            duration: 5000,
        });
    }
    
    return userMessage;
};

/**
 * Check if error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} True if retryable
 */
export const isRetryableError = (error) => {
    const status = error.response?.status;
    const message = error.message?.toLowerCase() || '';
    
    // Retry on network errors and specific status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const retryableMessages = ['network', 'timeout', 'fetch'];
    
    return (
        retryableStatuses.includes(status) ||
        retryableMessages.some(msg => message.includes(msg))
    );
};

/**
 * Get recovery action suggestion
 * @param {Error} error - Error object
 * @returns {string} Suggested recovery action
 */
export const getRecoverySuggestion = (error) => {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('card') && message.includes('expired')) {
        return 'Please update your payment method.';
    }
    if (message.includes('insufficient')) {
        return 'Please use a different payment method or add funds to your account.';
    }
    if (message.includes('network')) {
        return 'Please check your internet connection and try again.';
    }
    if (message.includes('subscription')) {
        return 'Please contact support to resolve subscription issues.';
    }
    
    return 'Please try again. If the problem persists, contact support.';
};