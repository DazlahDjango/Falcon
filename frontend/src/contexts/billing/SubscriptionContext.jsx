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
    const {
        subscription,
        loading,
        error,
        isActive,
        isOnTrial,
        trialDaysRemaining,
        daysUntilExpiry,
        canUpgrade,
        canDowngrade,
        canCancel,
        canRenew,
        status,
        plan,
        autoRenew,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        fetchSubscription,
        cancelSubscription,
        renewSubscription,
        upgradePlan,
        downgradePlan,
        updateAutoRenew,
    } = useSubscription();

    const [lastRefresh, setLastRefresh] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    // Refresh subscription data
    const refresh = useCallback(async () => {
        await fetchSubscription(true);
        setLastRefresh(new Date());
    }, [fetchSubscription]);

    // Handle upgrade with loading state
    const handleUpgrade = useCallback(async (planId, immediate = true) => {
        setPendingAction('upgrade');
        try {
            await upgradePlan(planId, immediate);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [upgradePlan, refresh]);

    // Handle downgrade with loading state
    const handleDowngrade = useCallback(async (planId, immediate = false) => {
        setPendingAction('downgrade');
        try {
            await downgradePlan(planId, immediate);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [downgradePlan, refresh]);

    // Handle cancellation with loading state
    const handleCancel = useCallback(async (atPeriodEnd = true, reason = '') => {
        setPendingAction('cancel');
        try {
            await cancelSubscription(atPeriodEnd, reason);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [cancelSubscription, refresh]);

    // Handle renewal
    const handleRenew = useCallback(async (paymentMethodId = null) => {
        setPendingAction('renew');
        try {
            await renewSubscription(paymentMethodId);
            await refresh();
            return true;
        } finally {
            setPendingAction(null);
        }
    }, [renewSubscription, refresh]);

    // Handle auto-renew toggle
    const handleAutoRenewToggle = useCallback(async (value) => {
        await updateAutoRenew(value);
        await refresh();
    }, [updateAutoRenew, refresh]);

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
        status,
        plan,
        autoRenew,
        cancelAtPeriodEnd,
        currentPeriodEnd,
        
        // Actions
        refresh,
        upgrade: handleUpgrade,
        downgrade: handleDowngrade,
        cancel: handleCancel,
        renew: handleRenew,
        setAutoRenew: handleAutoRenewToggle,
        
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
        status,
        plan,
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