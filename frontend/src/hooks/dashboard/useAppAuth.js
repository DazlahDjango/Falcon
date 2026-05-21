import { useSyncExternalStore } from 'react';
import store from '../../store';
import { selectAuth } from '../../store/accounts/slice/authSlice';

/**
 * Auth state from the main app store (safe inside DashboardStoreProvider).
 */
export const useAppAuth = () => {
  const auth = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => selectAuth(store.getState()),
    () => selectAuth(store.getState()),
  );

  return {
    user: auth?.user ?? null,
    isAuthenticated: Boolean(auth?.isAuthenticated),
    isLoading: Boolean(auth?.loading),
  };
};

export default useAppAuth;
