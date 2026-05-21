import { useCallback } from 'react';
import { store as appStore } from '../../store';

/**
 * Dispatch to the main app store while inside DashboardStoreProvider (nested Redux).
 */
export const useAppDispatch = () => useCallback(
  (action) => appStore.dispatch(action),
  [],
);

export default useAppDispatch;
