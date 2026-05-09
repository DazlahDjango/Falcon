import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { tenantService } from '../../services/tenant/tenant.service';
import { useAuthContext } from '../accounts/AuthContext';

const TenantContext = createContext(null);

/**
 * Custom hook to use the Tenant Context
 * Provides access to current tenant data, branding, and preferences
 */
export const useTenantContext = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenantContext must be used within a TenantProvider');
    }
    return context;
};

/**
 * Tenant Provider Component
 * Manages global tenant state, branding, and feature flags
 */
export const TenantProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuthContext();
    const [currentTenant, setCurrentTenant] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [branding, setBranding] = useState({
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        logoUrl: null,
        faviconUrl: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load tenant details and preferences
     */
    const loadTenantData = useCallback(async (tenantId) => {
        if (!tenantId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch detailed tenant info
            const response = await tenantService.getTenantDetails(tenantId);
            
            if (response.success && response.data) {
                const data = response.data;
                setCurrentTenant(data);
                
                // Set branding
                const newBranding = {
                    primaryColor: data.primary_color || '#2563eb',
                    secondaryColor: data.secondary_color || '#7c3aed',
                    logoUrl: data.logo || null,
                    faviconUrl: data.favicon || null
                };
                setBranding(newBranding);
                
                // Update CSS variables for dynamic branding
                updateCSSVariables(newBranding);
                
                // Set preferences from tenant settings
                setPreferences(data.settings || {});
            }
        } catch (err) {
            console.error('[TenantContext] Failed to load tenant data:', err);
            setError(err.message || 'Failed to load tenant configuration');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update CSS variables based on tenant branding
     */
    const updateCSSVariables = (brandingData) => {
        const root = document.documentElement;
        if (brandingData.primaryColor) {
            root.style.setProperty('--primary-color', brandingData.primaryColor);
            // Generate lighter/darker shades if needed
            root.style.setProperty('--primary-color-rgb', hexToRgb(brandingData.primaryColor));
        }
        if (brandingData.secondaryColor) {
            root.style.setProperty('--secondary-color', brandingData.secondaryColor);
        }
    };

    /**
     * Helper to convert Hex to RGB for opacity support in CSS
     */
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '37, 99, 235';
    };

    // Effect: Load tenant data when user changes or authenticates
    useEffect(() => {
        if (isAuthenticated && user?.tenant_id) {
            loadTenantData(user.tenant_id);
        } else {
            setCurrentTenant(null);
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.tenant_id, loadTenantData]);

    /**
     * Refresh current tenant data manually
     */
    const refreshTenant = useCallback(() => {
        if (user?.tenant_id) {
            return loadTenantData(user.tenant_id);
        }
    }, [user?.tenant_id, loadTenantData]);

    /**
     * Update branding manually (e.g. during preview)
     */
    const updateBranding = useCallback((newBranding) => {
        setBranding(prev => ({ ...prev, ...newBranding }));
        updateCSSVariables({ ...branding, ...newBranding });
    }, [branding]);

    // Context Value
    const value = useMemo(() => ({
        tenant: currentTenant,
        preferences,
        branding,
        isLoading,
        error,
        refreshTenant,
        updateBranding,
        isTrial: currentTenant?.subscription_plan === 'trial',
        hasFeature: (featureName) => !!currentTenant?.features?.[featureName],
        isFeatureEnabled: (featureName) => !!currentTenant?.features?.[featureName] || !!preferences?.[featureName],
    }), [currentTenant, preferences, branding, isLoading, error, refreshTenant, updateBranding]);

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};

export default TenantContext;
