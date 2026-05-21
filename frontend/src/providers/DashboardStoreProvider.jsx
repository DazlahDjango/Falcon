import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import dashboardRootReducer from '../store/dashboard/dashboardRootReducer';
import {
  dashboardCacheMiddleware,
  dashboardThrottleMiddleware,
} from '../store/dashboard/middleware';

let dashboardStoreInstance = null;

const createDashboardStore = () => configureStore({
  reducer: dashboardRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      dashboardCacheMiddleware,
      dashboardThrottleMiddleware,
    ),
  devTools: import.meta.env.DEV && { name: 'PMS Dashboard' },
});

export const getDashboardStore = () => {
  if (!dashboardStoreInstance) {
    dashboardStoreInstance = createDashboardStore();
  }
  return dashboardStoreInstance;
};

/**
 * Isolated Redux store for PMS dashboards. Intentionally NOT wired in root store/providers.
 */
export const DashboardStoreProvider = ({ children }) => {
  const store = useMemo(() => getDashboardStore(), []);
  return <Provider store={store}>{children}</Provider>;
};

export default DashboardStoreProvider;
