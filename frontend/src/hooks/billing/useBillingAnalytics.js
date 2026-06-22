import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchBillingSummary, fetchRevenueReport, fetchSubscriptionAnalytics,
    fetchRevenueForecast, fetchTaxReport, setDateRange, clearAnalytics, clearError,
} from '../../store/billing/slices/analyticsSlice';
import {
    selectBillingSummary, selectRevenueReport, selectSubscriptionAnalytics,
    selectRevenueForecast, selectTaxReport, selectAnalyticsLoading,
    selectAnalyticsError, selectMRR, selectMRRDisplay, selectTotalRevenue,
    selectTotalRevenueDisplay, selectActiveSubscriptionsCount,
    selectChurnRate, selectRevenueSuccessRate,
} from '../../store/billing/selectors';

export const useBillingAnalytics = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const hasFetched = useRef(false);
    const hasFetchedSubscriptions = useRef(false);
    
    const summary = useSelector(selectBillingSummary);
    const revenue = useSelector(selectRevenueReport);
    const subscriptions = useSelector(selectSubscriptionAnalytics);
    const forecast = useSelector(selectRevenueForecast);
    const taxReport = useSelector(selectTaxReport);
    const loading = useSelector(selectAnalyticsLoading);
    const error = useSelector(selectAnalyticsError);
    const mrr = useSelector(selectMRR);
    const mrrDisplay = useSelector(selectMRRDisplay);
    const totalRevenue = useSelector(selectTotalRevenue);
    const totalRevenueDisplay = useSelector(selectTotalRevenueDisplay);
    const activeSubscriptions = useSelector(selectActiveSubscriptionsCount);
    const churnRate = useSelector(selectChurnRate);
    const successRate = useSelector(selectRevenueSuccessRate);

    const fetchSummary = useCallback(() => dispatch(fetchBillingSummary()), [dispatch]);
    const fetchRevenue = useCallback((params) => dispatch(fetchRevenueReport(params)), [dispatch]);  // ← This is the correct name
    const fetchSubscriptions = useCallback(() => dispatch(fetchSubscriptionAnalytics()), [dispatch]);
    const fetchForecast = useCallback(() => dispatch(fetchRevenueForecast()), [dispatch]);
    const fetchTax = useCallback((year) => dispatch(fetchTaxReport(year)), [dispatch]);
    const updateDateRange = useCallback((range) => dispatch(setDateRange(range)), [dispatch]);
    const clear = useCallback(() => dispatch(clearAnalytics()), [dispatch]);
    const clearAnalyticsError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && !hasFetched.current) {
            hasFetched.current = true;
            
            // Sequential fetching with delays to prevent burst 429 errors from the server
            const loadData = async () => {
                await fetchSummary(); 
                
                await new Promise(resolve => setTimeout(resolve, 800));
                await fetchSubscriptions();
                
                await new Promise(resolve => setTimeout(resolve, 800));
                await fetchRevenue();
            };
            
            loadData();
        }
    }, [options.autoFetch]);

    return {
        summary, revenue, subscriptions, forecast, taxReport, loading, error,
        mrr, mrrDisplay, totalRevenue, totalRevenueDisplay, activeSubscriptions, churnRate, successRate,
        fetchSummary, fetchRevenue, fetchSubscriptions, fetchForecast, fetchTax,  // ← fetchRevenue is correct
        updateDateRange, clear, clearAnalyticsError,
    };
};

export default useBillingAnalytics;