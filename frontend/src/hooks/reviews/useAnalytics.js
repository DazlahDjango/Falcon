// src/hooks/reviews/useAnalytics.js
// Hook for fetching and managing analytics data

import { useState, useCallback, useEffect } from 'react';
import { analyticsService } from '../../services/reviews';
import { ANALYTICS_PERIODS } from '../../config/constants/reviewConstants';

export const useAnalytics = (options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [companyAnalytics, setCompanyAnalytics] = useState(null);
    const [departmentsAnalytics, setDepartmentsAnalytics] = useState([]);
    const [managersAnalytics, setManagersAnalytics] = useState([]);
    const [trends, setTrends] = useState(null);
    const [period, setPeriod] = useState(options.period || ANALYTICS_PERIODS.MONTH);

    /**
     * Fetch company level analytics
     */
    const fetchCompanyAnalytics = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getCompanyAnalytics({
                period,
                ...params
            });
            setCompanyAnalytics(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Fetch departments analytics
     */
    const fetchDepartmentsAnalytics = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getDepartmentsAnalytics({
                period,
                ...params
            });
            const results = data?.results || data?.departments || data;
            setDepartmentsAnalytics(Array.isArray(results) ? results : []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setDepartmentsAnalytics([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Fetch managers analytics
     */
    const fetchManagersAnalytics = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getManagersAnalytics({
                period,
                ...params
            });
            const results = data?.results || data?.managers || data;
            setManagersAnalytics(Array.isArray(results) ? results : []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setManagersAnalytics([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Fetch trends data
     */
    const fetchTrends = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getCompanyTrends({
                period,
                ...params
            });
            setTrends(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Fetch specific department analytics
     */
    const fetchDepartmentAnalytics = useCallback(async (departmentId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getDepartmentAnalytics(departmentId, {
                period,
                ...params
            });
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Fetch specific manager analytics
     */
    const fetchManagerAnalytics = useCallback(async (managerId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getManagerAnalytics(managerId, {
                period,
                ...params
            });
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Export analytics data
     */
    const exportAnalytics = useCallback(async (type, format, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const blob = await analyticsService.exportAnalytics(type, format, {
                period,
                ...params
            });
            return blob;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [period]);

    /**
     * Refresh all analytics data
     */
    const refreshAll = useCallback(async (params = {}) => {
        await Promise.all([
            fetchCompanyAnalytics(params),
            fetchDepartmentsAnalytics(params),
            fetchManagersAnalytics(params),
            fetchTrends(params)
        ]);
    }, [fetchCompanyAnalytics, fetchDepartmentsAnalytics, fetchManagersAnalytics, fetchTrends]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (options.autoFetch !== false) {
            refreshAll(options.initialParams);
        }
    }, []);

    return {
        loading,
        error,
        companyAnalytics,
        departmentsAnalytics,
        managersAnalytics,
        trends,
        period,
        setPeriod,
        fetchCompanyAnalytics,
        fetchDepartmentsAnalytics,
        fetchManagersAnalytics,
        fetchTrends,
        fetchDepartmentAnalytics,
        fetchManagerAnalytics,
        exportAnalytics,
        refreshAll
    };
};

export default useAnalytics;