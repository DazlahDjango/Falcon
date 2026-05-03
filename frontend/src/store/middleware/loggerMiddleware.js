const loggerMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    const prevState = store.getState();
    console.group(`[Redux] ${action.type}`);
    console.log('Action:', action);
    console.log('Prev State:', prevState);
    const result = next(action);
    const nextState = store.getState();
    console.log('Next State:', nextState);
    console.groupEnd();
    return result;
  }
  return next(action);
};

export default loggerMiddleware;