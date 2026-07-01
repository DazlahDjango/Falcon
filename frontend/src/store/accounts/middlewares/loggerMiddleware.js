const isDevelopment = import.meta.env.MODE === 'development';

export const loggerMiddleware = (store) => (next) => (action) => {
  if (!isDevelopment) {
    return next(action);
  }

  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  const actionType = action.type || 'UNKNOWN_ACTION';
  const isRejected = actionType.endsWith('/rejected');
  const isFulfilled = actionType.endsWith('/fulfilled');
  const isPending = actionType.endsWith('/pending');

  let color = '#4caf50';
  if (isRejected) color = '#f44336';
  else if (isPending) color = '#ff9800';
  else if (isFulfilled) color = '#2196f3';

  const groupLabel = `%c${actionType}`;
  console.groupCollapsed(groupLabel, `color: ${color}; font-weight: bold;`);

  console.log('%cAction:', 'color: #2196f3; font-weight: bold;', action);

  if (isRejected) {
    console.log('%cError:', 'color: #f44336; font-weight: bold;', action.payload || action.error);
  }

  console.log('%cPrevious State:', 'color: #ff9800;', prevState);
  console.log('%cNext State:', 'color: #4caf50;', nextState);

  console.groupEnd();

  return result;
};

export const errorLoggerMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type?.endsWith('/rejected')) {
    const error = action.payload || action.error;
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';

    console.error(
      `%c[ERROR] ${action.type}:`,
      'color: #f44336; font-weight: bold; background: #ffebee; padding: 4px 8px; border-radius: 4px;',
      errorMessage
    );

    if (error?.status === 401) {
      console.warn(
        '%c[WARN] Unauthorized request - session may be expired',
        'color: #ff9800; font-weight: bold;'
      );
    }

    if (error?.status === 403) {
      console.warn(
        '%c[WARN] Forbidden - insufficient permissions',
        'color: #ff9800; font-weight: bold;'
      );
    }

    if (error?.status === 429) {
      console.warn(
        '%c[WARN] Rate limit exceeded',
        'color: #ff9800; font-weight: bold;'
      );
    }

    if (error?.status >= 500) {
      console.error(
        '%c[CRITICAL] Server error',
        'color: #f44336; font-weight: bold; background: #ffcdd2; padding: 4px 8px; border-radius: 4px;',
        error
      );
    }

    if (!isDevelopment && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          action: action.type,
          status: error?.status,
        },
        extra: {
          payload: action.payload,
          error: action.error,
        },
      });
    }
  }

  return result;
};

export const performanceLoggerMiddleware = (store) => (next) => (action) => {
  if (!isDevelopment) {
    return next(action);
  }

  const start = performance.now();
  const result = next(action);
  const duration = performance.now() - start;

  if (duration > 100) {
    console.warn(
      `%c[PERF] ${action.type} took ${duration.toFixed(2)}ms`,
      'color: #ff9800; font-weight: bold;'
    );
  }

  return result;
};