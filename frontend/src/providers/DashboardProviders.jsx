import React from 'react';
import { DashboardStoreProvider } from './DashboardStoreProvider';
import { DashboardProfileProvider } from '../contexts/dashboard/DashboardProfileContext';
import { DashboardRealtimeProvider } from '../contexts/dashboard/DashboardRealtimeContext';
import { DashboardProvider } from '../contexts/dashboard/DashboardContext';

/**
 * Self-contained dashboard providers — wire in dashboard.routes only, not app root.
 */
export const DashboardProviders = ({ children }) => (
  <DashboardProfileProvider>
    <DashboardStoreProvider>
      <DashboardRealtimeProvider>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </DashboardRealtimeProvider>
    </DashboardStoreProvider>
  </DashboardProfileProvider>
);

export default DashboardProviders;
