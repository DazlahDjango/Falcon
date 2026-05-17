import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BillingAnalyticsService } from '../../services/billing';

export const useBillingAnalytics = (options = {}) => {
    const {
        autoFetch = true,
        defaultDays = 30,
    } = options;

    const [summary, setSummary] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [subscriptions, setSubscriptions] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [taxReport, setTaxReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
        days: defaultDays,
    });

    const optionsRef = useRef(options);
    const dateRangeRef = useRef(dateRange);

    useEffect(() => {
        optionsRef.current = options;
        dateRangeRef.current = dateRange;
    });

    // Fetch billing summary
    const fetchSummary = useCallback(async () => {
        try {
            const response = await BillingAnalyticsService.getBillingSummary();
            setSummary(response?.data || null);
            return response?.data;
        } catch (err) {
            console.error('[useBillingAnalytics] Error fetching summary:', err);
            return null;
        }
    }, []);

    // Fetch revenue report
    const fetchRevenue = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await BillingAnalyticsService.getRevenueReport({
                days: dateRangeRef.current.days,
                ...params,
            });
            setRevenue(response?.data || null);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch revenue data');
            console.error('[useBillingAnalytics] Error fetching revenue:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch subscription analytics
    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await BillingAnalyticsService.getSubscriptionAnalytics();
            setSubscriptions(response?.data || null);
            return response?.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch subscription analytics');
            console.error('[useBillingAnalytics] Error fetching subscriptions:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch revenue forecast
    const fetchForecast = useCallback(async () => {
        try {
            const response = await BillingAnalyticsService.getRevenueForecast();
            setForecast(response?.data || null);
            return response?.data;
        } catch (err) {
            console.error('[useBillingAnalytics] Error fetching forecast:', err);
            return null;
        }
    }, []);

    // Fetch tax report
    const fetchTaxReport = useCallback(async (year = null) => {
        try {
            const response = await BillingAnalyticsService.getTaxReport({
                year: year || new Date().getFullYear(),
            });
            setTaxReport(response?.data || null);
            return response?.data;
        } catch (err) {
            console.error('[useBillingAnalytics] Error fetching tax report:', err);
            return null;
        }
    }, []);

    // Update date range
    const updateDateRange = useCallback((days, startDate = null, endDate = null) => {
        setDateRange({ days, startDate, endDate });
    }, []);

    // Fetch all analytics
    const fetchAll = useCallback(async () => {
        await Promise.all([
            fetchSummary(),
            fetchRevenue(),
            fetchSubscriptions(),
            fetchForecast(),
            fetchTaxReport(),
        ]);
    }, [fetchSummary, fetchRevenue, fetchSubscriptions, fetchForecast, fetchTaxReport]);

    // Refresh data
    const refresh = useCallback(async () => {
        await fetchAll();
    }, [fetchAll]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchAll();
        }
    }, [autoFetch, fetchAll]);

    // Refetch revenue when date range changes
    useEffect(() => {
        if (autoFetch && dateRange.days) {
            fetchRevenue();
        }
    }, [dateRange.days, autoFetch, fetchRevenue]);

    // Memoized values
    const mrr = useMemo(() => subscriptions?.total_mrr || 0, [subscriptions]);
    const mrrDisplay = useMemo(() => {
        if (!mrr) return 'KES 0.00';
        return BillingAnalyticsService.formatCurrency(mrr);
    }, [mrr]);

    const totalRevenue = useMemo(() => revenue?.total_revenue || 0, [revenue]);
    const totalRevenueDisplay = useMemo(() => {
        if (!totalRevenue) return 'KES 0.00';
        return BillingAnalyticsService.formatCurrency(totalRevenue);
    }, [totalRevenue]);

    const successRate = useMemo(() => revenue?.success_rate || 0, [revenue]);
    const activeSubscriptions = useMemo(() => subscriptions?.total_active || 0, [subscriptions]);
    const churnRate = useMemo(() => {
        if (!subscriptions) return 0;
        const cancelled = subscriptions.total_cancelled || 0;
        const active = subscriptions.total_active || 0;
        return active + cancelled === 0 ? 0 : (cancelled / (active + cancelled)) * 100;
    }, [subscriptions]);

    return {
        // State
        summary,
        revenue,
        subscriptions,
        forecast,
        taxReport,
        loading,
        error,
        dateRange,
        
        // Computed
        mrr,
        mrrDisplay,
        totalRevenue,
        totalRevenueDisplay,
        successRate,
        activeSubscriptions,
        churnRate,
        
        // Actions
        fetchSummary,
        fetchRevenue,
        fetchSubscriptions,
        fetchForecast,
        fetchTaxReport,
        fetchAll,
        refresh,
        updateDateRange,
        
        // Helpers
        formatCurrency: BillingAnalyticsService.formatCurrency,
    };
};

export default useBillingAnalytics;