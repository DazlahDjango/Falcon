import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTenantPreferences } from '../../services/accounts/api/preferences';
import { useAuthContext } from './AuthContext';

const TenantContext = createContext(null);
export const useTenantContext = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenantContext must be used within TenantProvide');
    }
    return context;
};
export const TenantProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuthContext();
    const [tenant, setTenant] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [branding, setBranding] = useState({
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        logoUrl: null,
        faviconUrl: null
    });
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadTenant = async () => {
            if (!isAuthenticated || !user?.tenant_id) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await getTenantPreferences();
                const data = response.data;
                const newBranding = {
                    primaryColor: data.primary_color || '#2563eb',
                    secondaryColor: data.secondary_color || '#7c3aed',
                    logoUrl: data.logo_url,
                    faviconUrl: data.favicon_url
                };
                setTenant({
                    id: user.tenant_id,
                    name: data.name || 'Organization',
                    slug: data.slug,
                    subscription_plan: data.subscription_plan
                });
                setPreferences(data);
                setBranding(newBranding);
                document.documentElement.style.setProperty('--primary-color', newBranding.primaryColor);
                document.documentElement.style.setProperty('--secondary-color', newBranding.secondaryColor);
                if (newBranding.faviconUrl) {
                    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = newBranding.faviconUrl;
                    document.head.appendChild(link);
                }
            } catch (error) {
                console.error('Failed to load tenant:', error);
                // Set default values when tenant loading fails
                setBranding({
                    primaryColor: '#2563eb',
                    secondaryColor: '#7c3aed',
                    logoUrl: null,
                    faviconUrl: null
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadTenant();
    }, [isAuthenticated, user]);
    const updateBranding = useCallback((newBranding) => {
        setBranding(prev => ({ ...prev, ...newBranding }));
        
        if (newBranding.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', newBranding.primaryColor);
        }
        if (newBranding.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', newBranding.secondaryColor);
        }
    }, []);
    const isFeatureEnabled = useCallback((feature) => {
        return preferences?.features?.[feature] || false;
    }, [preferences]);
    const value = {
        tenant, 
        preferences,
        branding,
        isLoading,
        updateBranding,
        isFeatureEnabled
    };
    return (
        <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
    );
};