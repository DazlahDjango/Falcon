import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useDashboardProfile } from '../../hooks/dashboard/useDashboardProfile';
import { DASHBOARD_TYPES } from '../../config/constants/dashboardConstants';

const DashboardProfileContext = createContext(null);

const STORAGE_PREVIEW_ROLE_KEY = 'falcon_preview_role';
const STORAGE_PREVIEW_TENANT_KEY = 'falcon_preview_tenant';

export const DashboardProfileProvider = ({ children }) => {
  const { profile, loading, error, refresh, dashboardRole } = useDashboardProfile();

  const [previewRole, setPreviewRoleState] = useState(() => {
    return sessionStorage.getItem(STORAGE_PREVIEW_ROLE_KEY) || null;
  });

  const [previewTenant, setPreviewTenantState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_PREVIEW_TENANT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isSuperAdmin = profile?.role === 'super_admin' || dashboardRole === DASHBOARD_TYPES.SUPER_ADMIN;

  const setPreviewRole = (role) => {
    if (role) {
      sessionStorage.setItem(STORAGE_PREVIEW_ROLE_KEY, role);
    } else {
      sessionStorage.removeItem(STORAGE_PREVIEW_ROLE_KEY);
    }
    setPreviewRoleState(role);
  };

  const setPreviewTenant = (tenant) => {
    if (tenant) {
      sessionStorage.setItem(STORAGE_PREVIEW_TENANT_KEY, JSON.stringify(tenant));
    } else {
      sessionStorage.removeItem(STORAGE_PREVIEW_TENANT_KEY);
    }
    setPreviewTenantState(tenant);
  };

  const resetPreview = () => {
    sessionStorage.removeItem(STORAGE_PREVIEW_ROLE_KEY);
    sessionStorage.removeItem(STORAGE_PREVIEW_TENANT_KEY);
    setPreviewRoleState(null);
    setPreviewTenantState(null);
  };

  const activeDashboardRole = useMemo(() => {
    if (isSuperAdmin && previewRole) {
      return previewRole;
    }
    return dashboardRole;
  }, [isSuperAdmin, previewRole, dashboardRole]);

  const value = useMemo(() => ({
    profile,
    loading,
    error,
    refresh,
    dashboardRole: activeDashboardRole,
    realDashboardRole: dashboardRole,
    isSuperAdmin,
    previewRole: isSuperAdmin ? previewRole : null,
    previewTenant: isSuperAdmin ? previewTenant : null,
    setPreviewRole,
    setPreviewTenant,
    resetPreview,
    user: profile,
  }), [
    profile,
    loading,
    error,
    refresh,
    activeDashboardRole,
    dashboardRole,
    isSuperAdmin,
    previewRole,
    previewTenant,
  ]);

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

