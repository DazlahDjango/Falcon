const isDevelopment = process.env.NODE_ENV === 'development';

export const loggerMiddleware = (store) => (next) => (action) => {
    if (!isDevelopment) {
        return next(action);
    }
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    console.groupCollapsed(`%c${action.type}`, 'color: #4caf50; font-weight: bold');
    console.log('%cAction:', 'color: #2196f3', action);
    console.log('%cPrevious State:', 'color: #ff9800', prevState);
    console.log('%cNext State:', 'color: #4caf50', nextState);
    console.groupEnd();
    return result;
};
// Error logging middleware
export const errorLoggerMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    if (action.type?.endsWith('/rejected')) {
        console.error(
            `%cError in ${action.type}:`,
            'color: #f44336; font-weight: bold',
            action.payload || action.error
        );
        // Log to error tracking service in production
        if (!isDevelopment && window.Sentry) {
            window.Sentry.captureException(action.payload || action.error, {
                tags: { action: action.type }
            });
        }
    }
    return result;
};