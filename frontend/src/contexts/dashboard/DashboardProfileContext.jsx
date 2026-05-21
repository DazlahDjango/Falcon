import React, { createContext, useContext, useMemo } from 'react';
import { useDashboardProfile } from '../../hooks/dashboard/useDashboardProfile';

const DashboardProfileContext = createContext(null);

export const DashboardProfileProvider = ({ children }) => {
  const { profile, loading, error, refresh, dashboardRole } = useDashboardProfile();

  const value = useMemo(() => ({
    profile,
    loading,
    error,
    refresh,
    dashboardRole,
    user: profile,
  }), [profile, loading, error, refresh, dashboardRole]);

  return (
    <DashboardProfileContext.Provider value={value}>
      {children}
    </DashboardProfileContext.Provider>
  );
};

export const useDashboardProfileContext = () => {
  const ctx = useContext(DashboardProfileContext);
  if (!ctx) {
    throw new Error('useDashboardProfileContext must be used within DashboardProfileProvider');
  }
  return ctx;
};

export default DashboardProfileContext;
