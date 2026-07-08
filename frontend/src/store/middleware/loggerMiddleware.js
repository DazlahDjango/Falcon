const loggerMiddleware = (store) => (next) => (action) => {
  if (import.meta.env.MODE === 'development') {
    const prevState = store.getState();
    console.groupCollapsed(`[Redux] ${action.type}`);
    console.log('[ReduxLogger] Action:', action);
    console.log('[ReduxLogger] Previous State:', prevState);
    const result = next(action);
    const nextState = store.getState();
    console.log('[ReduxLogger] Next State:', nextState);
    console.log('[ReduxLogger] Stack:', new Error().stack);
    console.groupEnd();
    return result;
  }
  return next(action);
};

export default loggerMiddleware;