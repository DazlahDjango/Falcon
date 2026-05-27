import React from 'react';
import { Provider } from 'react-redux';
import { store as appStore } from '../store';

/**
 * Re-exposes the root Redux store inside nested providers (e.g. DashboardStoreProvider).
 */
const AppStoreProvider = ({ children }) => (
  <Provider store={appStore}>{children}</Provider>
);

export default AppStoreProvider;
