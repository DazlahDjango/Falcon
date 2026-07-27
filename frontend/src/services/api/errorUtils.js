// frontend/src/services/api/errorUtils.js
export const extractApiError = (error) => {
    if (typeof error === 'string') {
        return { message: error, status: 400, code: 'UNKNOWN_ERROR' };
    }

    if (error?.response?.data) {
        const data = error.response.data;
        return {
            message: data.message || data.error || data.detail || 'An error occurred',
            status: error.response.status || 500,
            code: data.code || 'API_ERROR',
            details: data.details || null,
            errors: data.errors || null,
        };
    }

    if (error?.message) {
        return {
            message: error.message,
            status: error.status || 500,
            code: error.code || 'UNKNOWN_ERROR',
            details: error.details || null,
        };
    }

    return {
        message: 'An unexpected error occurred',
        status: 500,
        code: 'UNKNOWN_ERROR',
        details: null,
    };
};