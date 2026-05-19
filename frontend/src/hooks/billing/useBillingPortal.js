import { useState, useEffect, useCallback } from 'react';
import { BillingPortalService } from '../../services/billing';
import { useSubscription } from './useSubscription';

export const useBillingPortal = (options = {}) => {
    const {
        autoFetchOverview = true,
    } = options;

    const [overview, setOverview] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [portalUrl, setPortalUrl] = useState(null);
    const [redirecting, setRedirecting] = useState(false);

    const { subscription, fetchSubscription } = useSubscription({ autoFetch: false });

    // Fetch portal overview
    const fetchOverview = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await BillingPortalService.getPortalOverview();
            setOverview(response?.data);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch portal overview');
            console.error('[useBillingPortal] Error fetching overview:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch billing settings
    const fetchSettings = useCallback(async () => {
        try {
            const response = await BillingPortalService.getBillingSettings();
            setSettings(response?.data);
            return response?.data;
        } catch (err) {
            console.error('[useBillingPortal] Error fetching settings:', err);
            return null;
        }
    }, []);

    // Update billing settings
    const updateSettings = useCallback(async (newSettings) => {
        setLoading(true);
        setError(null);

        try {
            const response = await BillingPortalService.updateBillingSettings(newSettings);
            setSettings(prev => ({ ...prev, ...response?.data }));
            
            // Refresh subscription if auto-renew changed
            if (newSettings.auto_renew !== undefined) {
                await fetchSubscription(true);
            }
            
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to update settings');
            console.error('[useBillingPortal] Error updating settings:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSubscription]);

    // Get portal access URL
    const getPortalAccess = useCallback(async (returnUrl = null) => {
        setLoading(true);
        setError(null);

        try {
            const response = await BillingPortalService.getPortalAccess(returnUrl);
            const url = response?.data?.portal_url;
            setPortalUrl(url);
            return url;
        } catch (err) {
            setError(err.message || 'Failed to get portal access');
            console.error('[useBillingPortal] Error getting portal access:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Redirect to portal
    const redirectToPortal = useCallback(async (returnUrl = null) => {
        setRedirecting(true);
        setError(null);

        try {
            const success = await BillingPortalService.redirectToPortal(returnUrl);
            return success;
        } catch (err) {
            setError(err.message || 'Failed to redirect to portal');
            console.error('[useBillingPortal] Error redirecting:', err);
            return false;
        } finally {
            setRedirecting(false);
        }
    }, []);

    // Open portal in new tab
    const openPortalInNewTab = useCallback(async (returnUrl = null) => {
        setLoading(true);
        setError(null);

        try {
            const success = await BillingPortalService.openPortalInNewTab(returnUrl);
            return success;
        } catch (err) {
            setError(err.message || 'Failed to open portal');
            console.error('[useBillingPortal] Error opening portal:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh all portal data
    const refresh = useCallback(async () => {
        await Promise.all([
            fetchOverview(),
            fetchSettings(),
            fetchSubscription(true),
        ]);
    }, [fetchOverview, fetchSettings, fetchSubscription]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetchOverview) {
            refresh();
        }
    }, [autoFetchOverview, refresh]);

    // Computed values
    const hasActiveSubscription = overview?.has_active_subscription || false;
    const currentPlan = overview?.current_plan;
    const isOnTrial = overview?.trial_info?.is_on_trial || false;
    const trialDaysRemaining = overview?.trial_info?.days_remaining || 0;
    const hasPaymentMethod = overview?.has_payment_method || false;
    const paymentMethods = overview?.payment_methods || [];

    return {
        // State
        overview,
        settings,
        loading,
        error,
        portalUrl,
        redirecting,
        
        // Computed
        hasActiveSubscription,
        currentPlan,
        isOnTrial,
        trialDaysRemaining,
        hasPaymentMethod,
        paymentMethods,
        recentInvoices: overview?.recent_invoices || [],
        
        // Actions
        fetchOverview,
        fetchSettings,
        updateSettings,
        getPortalAccess,
        redirectToPortal,
        openPortalInNewTab,
        refresh,
    };
};

export default useBillingPortal;