// ============================================
// frontend/src/contexts/reports/ReportFilterContext.jsx
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ReportFilterContext = createContext(null);

const initialFilterState = {
    search: '',
    domain: '',
    category: '',
    reportType: '',
    status: '',
    format: '',
    sensitivity: '',
    dateRange: {
        startDate: null,
        endDate: null,
        preset: 'all_time', // 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom'
    },
    isPublished: null,
    isArchived: false,
    sortBy: 'created_at',
    sortOrder: 'desc',
    tags: [],
};

export const ReportFilterProvider = ({ children, initialFilters = {} }) => {
    const [filters, setFilters] = useState({ ...initialFilterState, ...initialFilters });

    const setSearch = useCallback((search) => {
        setFilters(prev => ({ ...prev, search }));
    }, []);

    const setDomain = useCallback((domain) => {
        setFilters(prev => ({ ...prev, domain }));
    }, []);

    const setCategory = useCallback((category) => {
        setFilters(prev => ({ ...prev, category }));
    }, []);

    const setReportType = useCallback((reportType) => {
        setFilters(prev => ({ ...prev, reportType }));
    }, []);

    const setStatus = useCallback((status) => {
        setFilters(prev => ({ ...prev, status }));
    }, []);

    const setFormat = useCallback((format) => {
        setFilters(prev => ({ ...prev, format }));
    }, []);

    const setDateRange = useCallback((dateRange) => {
        setFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, ...dateRange }
        }));
    }, []);

    const setSort = useCallback((sortBy, sortOrder = 'desc') => {
        setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    }, []);

    const setTags = useCallback((tags) => {
        setFilters(prev => ({ ...prev, tags }));
    }, []);

    const setFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(initialFilterState);
    }, []);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.domain) count++;
        if (filters.category) count++;
        if (filters.reportType) count++;
        if (filters.status) count++;
        if (filters.format) count++;
        if (filters.sensitivity) count++;
        if (filters.dateRange?.startDate || filters.dateRange?.endDate || filters.dateRange?.preset !== 'all_time') count++;
        if (filters.isPublished !== null) count++;
        if (filters.isArchived) count++;
        if (filters.tags?.length > 0) count += filters.tags.length;
        return count;
    }, [filters]);

    const value = useMemo(() => ({
        filters,
        activeFilterCount,
        setSearch,
        setDomain,
        setCategory,
        setReportType,
        setStatus,
        setFormat,
        setDateRange,
        setSort,
        setTags,
        setFilter,
        updateFilters,
        resetFilters,
    }), [
        filters,
        activeFilterCount,
        setSearch,
        setDomain,
        setCategory,
        setReportType,
        setStatus,
        setFormat,
        setDateRange,
        setSort,
        setTags,
        setFilter,
        updateFilters,
        resetFilters,
    ]);

    return (
        <ReportFilterContext.Provider value={value}>
            {children}
        </ReportFilterContext.Provider>
    );
};

export const useReportFilterContext = () => {
    const context = useContext(ReportFilterContext);
    if (!context) {
        throw new Error('useReportFilterContext must be used within a ReportFilterProvider');
    }
    return context;
};

export default ReportFilterContext;
