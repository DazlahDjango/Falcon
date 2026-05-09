// frontend/src/hooks/tenant/useTenants.js
import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../../services/tenant/tenant.service';

export const useTenants = (initialFilters = {}) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState(initialFilters);

    const fetchTenants = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...filters,
            };

            const response = await tenantService.getTenants(params);
            if (response.success) {
                const items = response.data.results || response.data;
                const totalCount = response.data.count || items.length;

                setTenants(items);
                setTotal(totalCount);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to load tenants');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filters]);

    const refetch = useCallback(() => {
        fetchTenants();
    }, [fetchTenants]);

    const goToPage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    const setItemsPerPage = useCallback((newSize) => {
        setPageSize(newSize);
        setPage(1);
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
    }, []);

    const removeFilter = useCallback((key) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
        setPage(1);
    }, []);

    const searchTenants = useCallback((searchTerm) => {
        if (searchTerm) {
            updateFilters({ search: searchTerm });
        } else {
            removeFilter('search');
        }
    }, [updateFilters, removeFilter]);

    // ✅ Fix: Filter by is_active, not status
    const filterByActiveStatus = useCallback((isActive) => {
        if (isActive !== undefined && isActive !== null) {
            updateFilters({ is_active: isActive });
        } else {
            removeFilter('is_active');
        }
    }, [updateFilters, removeFilter]);

    const filterByPlan = useCallback((plan) => {
        if (plan) {
            updateFilters({ subscription_plan: plan });
        } else {
            removeFilter('subscription_plan');
        }
    }, [updateFilters, removeFilter]);

    const sortBy = useCallback((field, direction = 'desc') => {
        updateFilters({ ordering: `${direction === 'desc' ? '-' : ''}${field}` });
    }, [updateFilters]);

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const range = {
        start: (page - 1) * pageSize + 1,
        end: Math.min(page * pageSize, total),
    };

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    return {
        tenants,
        loading,
        error,
        total,
        page,
        pageSize,
        totalPages,
        filters,
        range,
        goToPage,
        setItemsPerPage,
        hasNextPage,
        hasPrevPage,
        updateFilters,
        clearFilters,
        removeFilter,
        searchTenants,
        filterByActiveStatus,
        filterByPlan,
        sortBy,
        refetch,
    };
};