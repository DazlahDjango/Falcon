const isDevelopment = import.meta.env.MODE === 'development';

const ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please login again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This operation conflicts with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timed out. Please try again.',
};

const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;

  const status = error?.status || error?.response?.status;
  if (status && ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }

  const message = error?.message || error?.response?.data?.error || error?.response?.data?.message || error?.data?.error || error?.data?.message;

  if (message) return message;

  return 'An unexpected error occurred. Please try again.';
};

const getErrorDetails = (error) => {
  const details = {
    status: error?.status || error?.response?.status || null,
    code: error?.code || error?.response?.data?.code || null,
    errors: error?.response?.data?.errors || error?.errors || null,
  };

  if (error?.response?.data?.detail) {
    details.detail = error.response.data.detail;
  }

  if (error?.response?.data?.validation) {
    details.validation = error.response.data.validation;
  }

  return details;
};

export const errorHandlerMiddleware = (store) => (next) => (action) => {
  if (action.type?.endsWith('/rejected')) {
    const error = action.payload || action.error;
    const errorMessage = getErrorMessage(error);
    const errorDetails = getErrorDetails(error);

    const errorState = {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      actionType: action.type,
    };

    if (!isDevelopment) {
      console.error('[ERROR HANDLER]', errorState);
    }

    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast({
        message: errorMessage,
        type: 'error',
        duration: 5000,
      });
    }

    const enhancedError = {
      ...error,
      message: errorMessage,
      displayMessage: errorMessage,
      details: errorDetails,
    };

    const enhancedAction = {
      ...action,
      payload: enhancedError,
    };

    return next(enhancedAction);
  }

  return next(action);
};

export const networkErrorMiddleware = (store) => (next) => (action) => {
  if (action.type?.endsWith('/rejected')) {
    const error = action.payload || action.error;

    if (error?.message?.includes('Network Error') || error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      const networkError = {
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        originalError: error,
      };

      const enhancedAction = {
        ...action,
        payload: networkError,
      };

      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast({
          message: 'Network error. Please check your connection.',
          type: 'error',
          duration: 5000,
        });
      }

      return next(enhancedAction);
    }

    if (error?.status === 401) {
      const state = store.getState();
      if (state.auth?.isAuthenticated) {
        Promise.all([
          import('../slice/authSlice').then(({ logout }) => store.dispatch(logout())),
          import('../../index').then(({ persistor }) => persistor.purge()),
        ]).finally(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        });
      }
    }

    if (error?.status === 403) {
      const state = store.getState();
      const user = state.auth?.user;
      if (!user?.is_superuser && user?.role !== 'client_admin') {
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast({
            message: 'You need administrator privileges for this action.',
            type: 'warning',
            duration: 5000,
          });
        }
      }
    }
  }

  return next(action);
};

export const retryMiddleware = (store) => (next) => (action) => {
  if (action.type?.endsWith('/rejected') && action.meta?.retry !== true) {
    const error = action.payload || action.error;

    const shouldRetry = error?.status === 429 || error?.status === 503 || error?.status === 504 || error?.code === 'ECONNABORTED';

    if (shouldRetry && action.meta?.attempts < 3) {
      const attempts = (action.meta?.attempts || 0) + 1;
      const delay = Math.pow(2, attempts) * 1000;

      const retryAction = {
        ...action,
        meta: {
          ...action.meta,
          attempts,
          retry: true,
        },
      };

      if (isDevelopment) {
        console.log(`[RETRY] Attempt ${attempts} for ${action.type} in ${delay}ms`);
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(next(retryAction));
        }, delay);
      });
    }
  }

  return next(action);
};