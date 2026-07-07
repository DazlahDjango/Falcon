import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useOrganizations } from '../../hooks/tenant';
import { useAuthContext } from '../accounts/AuthContext';

const TenantContext = createContext(null);

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [currentTenant, setCurrentTenant] = useState(null);
  const [branding, setBranding] = useState({
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    logoUrl: null,
    faviconUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchOne } = useOrganizations({ autoFetch: false });

  const loadTenantData = useCallback(async (tenantId) => {
    if (!tenantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOne(tenantId);
      if (data) {
        setCurrentTenant(data);
        const newBranding = {
          primaryColor: data.primary_color || '#2563EB',
          secondaryColor: data.secondary_color || '#7C3AED',
          logoUrl: data.logo || null,
          faviconUrl: data.favicon || null,
        };
        setBranding(newBranding);
        updateCSSVariables(newBranding);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tenant configuration');
    } finally {
      setIsLoading(false);
    }
  }, [fetchOne]);

  const updateCSSVariables = (brandingData) => {
    const root = document.documentElement;
    if (brandingData.primaryColor) {
      root.style.setProperty('--primary-color', brandingData.primaryColor);
      root.style.setProperty('--primary-color-rgb', hexToRgb(brandingData.primaryColor));
    }
    if (brandingData.secondaryColor) {
      root.style.setProperty('--secondary-color', brandingData.secondaryColor);
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '37, 99, 235';
  };

  useEffect(() => {
    if (isAuthenticated && user?.tenant_id) {
      loadTenantData(user.tenant_id);
    } else {
      setCurrentTenant(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.tenant_id, loadTenantData]);

  const refreshTenant = useCallback(() => {
    if (user?.tenant_id) {
      return loadTenantData(user.tenant_id);
    }
  }, [user?.tenant_id, loadTenantData]);

  const updateBranding = useCallback((newBranding) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
    updateCSSVariables({ ...branding, ...newBranding });
  }, [branding]);

  const value = useMemo(() => ({
    tenant: currentTenant,
    branding,
    isLoading,
    error,
    refreshTenant,
    updateBranding,
    isActive: currentTenant?.is_active || false,
    isOnboarded: currentTenant?.is_onboarded || false,
    subscriptionTier: currentTenant?.subscription_tier || 'free',
    tenantId: currentTenant?.id || null,
    tenantName: currentTenant?.name || null,
    tenantSlug: currentTenant?.slug || null,
    tenantStatus: currentTenant?.status || null,
  }), [currentTenant, branding, isLoading, error, refreshTenant, updateBranding]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;