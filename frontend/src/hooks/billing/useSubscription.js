/**
 * useSubscription Hook
 * Manages current subscription state with real-time updates
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SubscriptionService } from '../../services/billing';
import { SUBSCRIPTION_STATUS, BILLING_INTERVALS } from '../../config/constants/billingConstants';

export const useSubscription = (options = {}) => {
    const {
        autoFetch = true,
        refreshInterval = null, // Auto-refresh in ms
        onSubscriptionChange = null,
    } = options;

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Use refs to stabilize callbacks
    const subscriptionRef = useRef(subscription);
    const optionsRef = useRef(options);

    useEffect(() => {
        subscriptionRef.current = subscription;
        optionsRef.current = options;
    });

    // Fetch current subscription
    const fetchSubscription = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) setRefreshing(true);
        setLoading(true);

        try {
            const response = await SubscriptionService.getCurrentSubscription();
            const data = response?.data || null;
            
            const previousStatus = subscriptionRef.current?.status;
            setSubscription(data);
            
            const { onSubscriptionChange } = optionsRef.current;
            
            // Notify on status change
            if (previousStatus && previousStatus !== data?.status && onSubscriptionChange) {
                onSubscriptionChange({
                    previousStatus,
                    newStatus: data?.status,
                    subscription: data,
                });
            }
            
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch subscription');
            console.error('[useSubscription] Error:', err);
            return null;
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Cancel subscription
    const cancelSubscription = useCallback(async (options = {}) => {
        if (!subscription?.id) {
            throw new Error('No active subscription to cancel');
        }

        try {
            const response = await SubscriptionService.cancelSubscription(
                subscription.id,
                options
            );
            
            // Refresh subscription state
            await fetchSubscription(true);
            return response?.data;
        } catch (err) {
            console.error('[useSubscription] Error cancelling:', err);
            throw err;
        }
    }, [subscription, fetchSubscription]);

    // Renew subscription
    const renewSubscription = useCallback(async (paymentMethodId = null) => {
        if (!subscription?.id) {
            throw new Error('No subscription to renew');
        }

        try {
            const response = await SubscriptionService.renewSubscription(
                subscription.id,
                { payment_method_id: paymentMethodId }
            );
            
            await fetchSubscription(true);
            return response?.data;
        } catch (err) {
            console.error('[useSubscription] Error renewing:', err);
            throw err;
        }
    }, [subscription, fetchSubscription]);

    // Upgrade subscription
    const upgradePlan = useCallback(async (planId, immediate = true) => {
        if (!subscription?.id) {
            throw new Error('No subscription to upgrade');
        }

        try {
            const response = await SubscriptionService.upgradeSubscription(
                subscription.id,
                { plan_id: planId, immediate }
            );
            
            await fetchSubscription(true);
            return response?.data;
        } catch (err) {
            console.error('[useSubscription] Error upgrading:', err);
            throw err;
        }
    }, [subscription, fetchSubscription]);

    // Downgrade subscription
    const downgradePlan = useCallback(async (planId, immediate = false) => {
        if (!subscription?.id) {
            throw new Error('No subscription to downgrade');
        }

        try {
            const response = await SubscriptionService.downgradeSubscription(
                subscription.id,
                { plan_id: planId, immediate }
            );
            
            await fetchSubscription(true);
            return response?.data;
        } catch (err) {
            console.error('[useSubscription] Error downgrading:', err);
            throw err;
        }
    }, [subscription, fetchSubscription]);

    // Update auto-renew setting
    const updateAutoRenew = useCallback(async (autoRenew) => {
        if (!subscription?.id) return;

        try {
            const response = await SubscriptionService.updateSubscription(
                subscription.id,
                { auto_renew: autoRenew }
            );
            
            setSubscription(prev => ({
                ...prev,
                auto_renew: autoRenew,
            }));
            
            return response?.data;
        } catch (err) {
            console.error('[useSubscription] Error updating auto-renew:', err);
            throw err;
        }
    }, [subscription]);

    // Auto-refresh subscription
    useEffect(() => {
        if (autoFetch) {
            fetchSubscription();
        }
    }, [autoFetch, fetchSubscription]);

    useEffect(() => {
        if (!refreshInterval) return;

        const intervalId = setInterval(() => {
            fetchSubscription(true);
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [refreshInterval, fetchSubscription]);

    // Memoized values
    const isActive = useMemo(() => {
        return subscription?.is_active_status?.is_active || false;
    }, [subscription]);

    const isOnTrial = useMemo(() => {
        return subscription?.is_active_status?.is_on_trial || false;
    }, [subscription]);

    const trialDaysRemaining = useMemo(() => {
        return subscription?.is_active_status?.trial_days_remaining || 0;
    }, [subscription]);

    const daysUntilExpiry = useMemo(() => {
        return subscription?.is_active_status?.days_until_expiry || 0;
    }, [subscription]);

    const isExpiringSoon = useMemo(() => {
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    }, [daysUntilExpiry]);

    const status = useMemo(() => {
        return subscription?.status || null;
    }, [subscription]);

    const plan = useMemo(() => {
        return subscription?.plan || null;
    }, [subscription]);

    const canUpgrade = useMemo(() => {
        if (!subscription || !isActive) return false;
        const currentType = subscription.plan?.plan_type;
        return currentType === 'basic' || currentType === 'professional';
    }, [subscription, isActive]);

    const canDowngrade = useMemo(() => {
        if (!subscription || !isActive) return false;
        const currentType = subscription.plan?.plan_type;
        return currentType === 'professional' || currentType === 'enterprise';
    }, [subscription, isActive]);

    const canCancel = useMemo(() => {
        return isActive && !subscription?.cancel_at_period_end;
    }, [isActive, subscription]);

    const canRenew = useMemo(() => {
        return isActive && subscription?.auto_renew === false;
    }, [isActive, subscription]);

    return {
        // State
        subscription,
        loading,
        error,
        refreshing,
        
        // Status flags
        isActive,
        isOnTrial,
        isExpiringSoon,
        canUpgrade,
        canDowngrade,
        canCancel,
        canRenew,
        
        // Details
        status,
        plan,
        trialDaysRemaining,
        daysUntilExpiry,
        autoRenew: subscription?.auto_renew || false,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        currentPeriodEnd: subscription?.current_period_end,
        
        // Actions
        fetchSubscription,
        cancelSubscription,
        renewSubscription,
        upgradePlan,
        downgradePlan,
        updateAutoRenew,
    };
};

export default useSubscription;