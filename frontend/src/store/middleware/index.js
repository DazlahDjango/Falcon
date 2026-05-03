export { default as loggerMiddleware } from './loggerMiddleware';
export { default as errorMiddleware } from './errorMiddleware';
export { default as authMiddleware } from './authMiddleware';
export { default as persistenceMiddleware, loadPersistedState } from './persistenceMiddleware';
export { default as offlineMiddleware, initOfflineListeners } from './offlineMiddleware';

export const getMiddlewares = (getDefaultMiddleware) => {
  const middlewares = [
    errorMiddleware,
    authMiddleware,
    persistenceMiddleware,
    offlineMiddleware,
  ];
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware);
  }
  return getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['ui/openConfirmModal', 'ui/closeConfirmModal'],
      ignoredPaths: ['ui.modals.confirm.onConfirm'],
    },
    thunk: {
      extraArgument: {},
    },
  }).concat(middlewares);
};