import React from 'react';
import { Provider } from 'react-redux';
import { store as mainStore } from '../store';

export const getDashboardStore = () => mainStore;

/**
 * Unified Redux store provider for PMS dashboards.
 * Delegates to the unified primary Redux store instance.
 */
export const DashboardStoreProvider = ({ children }) => {
  return <Provider store={mainStore}>{children}</Provider>;
};

export default DashboardStoreProvider;
