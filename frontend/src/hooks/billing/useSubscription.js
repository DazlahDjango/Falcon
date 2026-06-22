import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCurrentSubscription, fetchSubscriptionById, updateSubscriptionSettings,
    cancelSubscription, renewSubscription, upgradeSubscription, downgradeSubscription,
    extendTrial, getSubscriptionUsage, clearCurrentSubscription, clearError,
} from '../../store/billing/slices/subscriptionSlice';
import {
    selectCurrentSubscription, selectSubscriptionUsage, selectSubscriptionsLoading,
    selectSubscriptionsError, selectIsSubscriptionActive, selectIsOnTrial,
    selectTrialDaysRemaining, selectDaysUntilExpiry, selectCurrentPlanType,
    selectAutoRenewEnabled, selectCancelAtPeriodEnd,
} from '../../store/billing/selectors';

export const useSubscription = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const subscription = useSelector(selectCurrentSubscription);
    const usage = useSelector(selectSubscriptionUsage);
    const loading = useSelector(selectSubscriptionsLoading);
    const error = useSelector(selectSubscriptionsError);
    const isActive = useSelector(selectIsSubscriptionActive);
    const isOnTrial = useSelector(selectIsOnTrial);
    const trialDaysRemaining = useSelector(selectTrialDaysRemaining);
    const daysUntilExpiry = useSelector(selectDaysUntilExpiry);
    const planType = useSelector(selectCurrentPlanType);
    const autoRenew = useSelector(selectAutoRenewEnabled);
    const cancelAtPeriodEnd = useSelector(selectCancelAtPeriodEnd);
    const hasFetched = useRef(false);
    const hasFetchedUsage = useRef(false);

    const fetchCurrent = useCallback(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            return dispatch(fetchCurrentSubscription());
        }
        return Promise.resolve();
    }, [dispatch]);
    
    const fetchById = useCallback((id) => dispatch(fetchSubscriptionById(id)), [dispatch]);
    const updateSettings = useCallback((id, autoRenewValue) => dispatch(updateSubscriptionSettings({ id, autoRenew: autoRenewValue })), [dispatch]);
    const cancel = useCallback((id, atPeriodEnd = true, reason = '') => dispatch(cancelSubscription({ id, atPeriodEnd, reason })), [dispatch]);
    const renew = useCallback((id, paymentMethodId = null) => dispatch(renewSubscription({ id, paymentMethodId })), [dispatch]);
    const upgrade = useCallback((id, planId, immediate = true) => dispatch(upgradeSubscription({ id, planId, immediate })), [dispatch]);
    const downgrade = useCallback((id, planId, immediate = false) => dispatch(downgradeSubscription({ id, planId, immediate })), [dispatch]);
    const extendTrialPeriod = useCallback((id, extraDays = 7) => dispatch(extendTrial({ id, extraDays })), [dispatch]);
    
    const fetchUsage = useCallback((id) => {
        if (!hasFetchedUsage.current) {
            hasFetchedUsage.current = true;
            return dispatch(getSubscriptionUsage(id));
        }
        return Promise.resolve();
    }, [dispatch]);
    
    const clear = useCallback(() => dispatch(clearCurrentSubscription()), [dispatch]);
    const clearSubscriptionError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch) {
            fetchCurrent();
        }
    }, [options.autoFetch]);

    return {
        subscription, usage, loading, error, isActive, isOnTrial,
        trialDaysRemaining, daysUntilExpiry, planType, autoRenew, cancelAtPeriodEnd,
        fetchCurrent, fetchById, updateSettings, cancel, renew, upgrade, downgrade,
        extendTrialPeriod, fetchUsage, clear, clearSubscriptionError,
    };
};

export default useSubscription;