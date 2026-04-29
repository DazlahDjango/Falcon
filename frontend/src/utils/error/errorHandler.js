import { ERROR_MESSAGES } from '../kpi/constants';

/**
 * Error handler class for centralized error management
 */
class ErrorHandler {
    constructor() {
        this.errorListeners = [];
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    /**
     * Handle error
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    handleError(error, context = {}) {
        const formattedError = this.formatError(error);
        
        // Log error
        this.logError(formattedError, context);
        
        // Notify listeners
        this.notifyListeners(formattedError, context);
        
        return formattedError;
    }

    /**
     * Format error for display
     * @param {Error} error - Error object
     * @returns {Object} Formatted error
     */
    formatError(error) {
        const isAxiosError = error.isAxiosError || error.response;
        
        if (isAxiosError) {
            const status = error.response?.status;
            const data = error.response?.data;
            
            return {
                type: 'api',
                status,
                message: this.getApiErrorMessage(status, data),
                details: this.isDevelopment ? data : null,
                originalError: this.isDevelopment ? error : null
            };
        }
        
        return {
            type: 'client',
            message: error.message || ERROR_MESSAGES.SERVER,
            details: this.isDevelopment ? error.stack : null,
            originalError: this.isDevelopment ? error : null
        };
    }

    /**
     * Get API error message
     * @param {number} status - HTTP status code
     * @param {Object} data - Response data
     * @returns {string} Error message
     */
    getApiErrorMessage(status, data) {
        if (data?.message) return data.message;
        if (data?.error) return data.error;
        
        switch (status) {
            case 400:
                return ERROR_MESSAGES.VALIDATION;
            case 401:
                return ERROR_MESSAGES.UNAUTHORIZED;
            case 403:
                return 'You do not have permission to perform this action';
            case 404:
                return ERROR_MESSAGES.NOT_FOUND;
            case 429:
                return ERROR_MESSAGES.RATE_LIMIT;
            case 500:
            case 502:
            case 503:
                return ERROR_MESSAGES.SERVER;
            default:
                return ERROR_MESSAGES.SERVER;
        }
    }

    /**
     * Log error to console or service
     * @param {Object} error - Formatted error
     * @param {Object} context - Error context
     */
    logError(error, context) {
        console.error('[ErrorHandler]', {
            ...error,
            context,
            timestamp: new Date().toISOString()
        });
        
        // TODO: Send to logging service (e.g., Sentry, LogRocket)
        if (process.env.NODE_ENV === 'production') {
            // this.sendToLoggingService(error, context);
        }
    }

    /**
     * Notify error listeners
     * @param {Object} error - Formatted error
     * @param {Object} context - Error context
     */
    notifyListeners(error, context) {
        this.errorListeners.forEach(listener => {
            try {
                listener(error, context);
            } catch (e) {
                console.error('Error listener failed:', e);
            }
        });
    }

    /**
     * Add error listener
     * @param {Function} listener - Listener function
     */
    addErrorListener(listener) {
        this.errorListeners.push(listener);
    }

    /**
     * Remove error listener
     * @param {Function} listener - Listener to remove
     */
    removeErrorListener(listener) {
        const index = this.errorListeners.indexOf(listener);
        if (index > -1) {
            this.errorListeners.splice(index, 1);
        }
    }

    /**
     * Clear all error listeners
     */
    clearErrorListeners() {
        this.errorListeners = [];
    }

    /**
     * Create user-friendly error message
     * @param {Error} error - Error object
     * @returns {string} User-friendly message
     */
    getUserMessage(error) {
        const formatted = this.formatError(error);
        return formatted.message;
    }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Wrapper for async functions to catch errors
 * @param {Function} fn - Async function
 * @returns {Function} Wrapped function
 */
export const catchAsync = (fn) => {
    return (...args) => {
        return fn(...args).catch(error => {
            errorHandler.handleError(error);
            throw error;
        });
    };
};