import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSubscription } from '../../hooks/billing';

const SubscriptionContext = createContext(null);

export const useSubscriptionContext = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider = ({ children }) => {
    // FIX: Get the correct functions from useSubscription
    const {
        subscription,
        loading,
        error,
        isActive,
        isOnTrial,
        trialDaysRemaining,
        daysUntilExpiry,
        planType,
        autoRenew,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        fetchCurrent,        // ← This is the correct function name
        cancel,
        renew,
        upgrade,
        downgrade,
        updateSettings,
        fetchUsage,
    } = useSubscription();

    const [lastRefresh, setLastRefresh] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    // Refresh subscription data - FIX: use fetchCurrent
    const refresh = useCallback(async () => {
        await fetchCurrent();
        setLastRefresh(new Date());
    }, [fetchCurrent]);

    // Can upgrade/downgrade based on plan type
    const canUpgrade = planType === 'basic' || planType === 'professional';
    const canDowngrade = planType === 'professional' || planType === 'enterprise';
    const canCancel = isActive && !cancelAtPeriodEnd;
    const canRenew = !autoRenew && isActive && daysUntilExpiry <= 7;

    // Handle upgrade with loading state
    const handleUpgrade = useCallback(async (planId, immediate = true) => {
        setPendingAction('upgrade');
        try {
            await upgrade(planId, immediate);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [upgrade, refresh]);

    // Handle downgrade with loading state
    const handleDowngrade = useCallback(async (planId, immediate = false) => {
        setPendingAction('downgrade');
        try {
            await downgrade(planId, immediate);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [downgrade, refresh]);

    // Handle cancellation with loading state
    const handleCancel = useCallback(async (atPeriodEnd = true, reason = '') => {
        setPendingAction('cancel');
        try {
            await cancel(atPeriodEnd, reason);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [cancel, refresh]);

    // Handle renewal
    const handleRenew = useCallback(async (paymentMethodId = null) => {
        setPendingAction('renew');
        try {
            await renew(paymentMethodId);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [renew, refresh]);

    // Handle auto-renew toggle
    const handleAutoRenewToggle = useCallback(async (value) => {
        await updateSettings(value);
        await refresh();
    }, [updateSettings, refresh]);

    // Auto-refresh on mount and periodically
    useEffect(() => {
        refresh();
        
        const interval = setInterval(() => {
            refresh();
        }, 5 * 60 * 1000); // Refresh every 5 minutes
        
        return () => clearInterval(interval);
    }, [refresh]);

    const value = React.useMemo(() => ({
        // State
        subscription,
        loading,
        error,
        lastRefresh,
        pendingAction,
        
        // Status flags
        isActive,
        isOnTrial,
        trialDaysRemaining,
        daysUntilExpiry,
        canUpgrade,
        canDowngrade,
        canCancel,
        canRenew,
        status: subscription?.status,
        plan: subscription?.plan,
        autoRenew,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        
        // Actions
        refresh,
        fetchSubscription: refresh,  // ← ADD THIS alias for compatibility
        upgrade: handleUpgrade,
        downgrade: handleDowngrade,
        cancel: handleCancel,
        renew: handleRenew,
        setAutoRenew: handleAutoRenewToggle,
        cancelSubscription: handleCancel,  // ← ADD THIS alias
        renewSubscription: handleRenew,    // ← ADD THIS alias
        upgradePlan: handleUpgrade,        // ← ADD THIS alias
        downgradePlan: handleDowngrade,    // ← ADD THIS alias
        updateAutoRenew: handleAutoRenewToggle,  // ← ADD THIS alias
        
        // Helpers
        isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
        shouldShowTrialBanner: isOnTrial && trialDaysRemaining <= 7,
    }), [
        subscription,
        loading,
        error,
        lastRefresh,
        pendingAction,
        isActive,
        isOnTrial,
        trialDaysRemaining,
        daysUntilExpiry,
        canUpgrade,
        canDowngrade,
        canCancel,
        canRenew,
        subscription?.status,
        subscription?.plan,
        autoRenew,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        refresh,
        handleUpgrade,
        handleDowngrade,
        handleCancel,
        handleRenew,
        handleAutoRenewToggle
    ]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};