import { addToast } from "../ui/slices/uiSlice";

const errorMiddleware = (store) => (next) => (action) => {
  // Check if the action is a rejected async thunk
  if (action.type?.endsWith('/rejected')) {
    const errorMessage = action.payload?.message || action.error?.message || 'An unexpected error occurred';
    const errorStatus = action.payload?.status || action.error?.status || 500;
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error] ${action.type}:`, errorMessage, errorStatus);
    }
    // Don't show toast for 401 errors (handled by auth middleware)
    if (errorStatus !== 401) {
      store.dispatch(addToast({
        message: errorMessage,
        type: 'error',
        title: 'Error',
        duration: 5000,
      }));
    }
  }
  return next(action);
};
export default errorMiddleware;