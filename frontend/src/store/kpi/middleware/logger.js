/**
 * Redux Logger Middleware
 * Logs actions and state changes in development
 */

const loggerMiddleware = (store) => (next) => (action) => {
    if (process.env.NODE_ENV !== 'development') {
        return next(action);
    }

    console.group(`%c${action.type}`, 'color: #3b82f6; font-weight: bold');
    console.log('%cPrevious State:', 'color: #6b7280', store.getState());
    console.log('%cAction:', 'color: #eab308', action);
    const result = next(action);
    console.log('%cNext State:', 'color: #22c55e', store.getState());
    console.groupEnd();

    return result;
};

export default loggerMiddleware;