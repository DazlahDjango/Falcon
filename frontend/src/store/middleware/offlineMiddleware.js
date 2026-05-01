import { addToast, setOnlineStatus } from '../ui/slices/uiSlice';

let actionQueue = [];
let isProcessing = false;

const processQueue = async (store) => {
  if (isProcessing) return;
  isProcessing = true;
  while (actionQueue.length > 0 && navigator.onLine) {
    const queuedAction = actionQueue.shift();
    try {
      await store.dispatch(queuedAction);
    } catch (error) {
      console.error('[Offline] Failed to process queued action:', error);
      store.dispatch(addToast({
        message: `Failed to sync: ${error.message}`,
        type: 'error',
        duration: 5000,
      }));
    }
  }
  isProcessing = false;
};

const offlineMiddleware = (store) => (next) => (action) => {
  // Track online/offline status
  if (action.type === setOnlineStatus.type) {
    if (action.payload === true && actionQueue.length > 0) {
      processQueue(store);
    }
    return next(action);
  }
  // Check if action should be queued when offline
  const isOfflineAction = action.meta?.offline?.queue !== false;
  const isMutation = action.type?.includes('/create') || 
                     action.type?.includes('/update') || 
                     action.type?.includes('/delete') ||
                     action.type?.includes('/move');
  
  if (!navigator.onLine && isOfflineAction && isMutation) {
    // Queue the action for later
    actionQueue.push(action);
    store.dispatch(addToast({
      message: 'You are offline. This action will be synced when connection returns.',
      type: 'warning',
      title: 'Offline Mode',
      duration: 3000,
    }));
    return action;
  }  
  return next(action);
};

// Listen to online/offline events
export const initOfflineListeners = (store) => {
  window.addEventListener('online', () => {
    store.dispatch(setOnlineStatus(true));
    store.dispatch(addToast({
      message: 'Connection restored. Syncing pending actions...',
      type: 'success',
      title: 'Back Online',
      duration: 3000,
    }));
  });
  window.addEventListener('offline', () => {
    store.dispatch(setOnlineStatus(false));
    store.dispatch(addToast({
      message: 'You are offline. Some features may be limited.',
      type: 'warning',
      title: 'Offline Mode',
      duration: 3000,
    }));
  });
};
export default offlineMiddleware;