// frontend/src/hooks/tenant/useTenants.js
import { useState, useEffect, useCallback } from 'react';
import { TenantService } from '../../services/tenant';

export const useTenants = (initialFilters = {}) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filters, setFilters] = useState(initialFilters);

    // Fetch tenants list
    const fetchTenants = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...filters,
            };

            const response = await TenantService.getTenants(params);
            if (response.success) {
                // Handle paginated response
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

    // Refetch current page
    const refetch = useCallback(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Change page
    const goToPage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    // Change page size
    const setItemsPerPage = useCallback((newSize) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page
    }, []);

    // Update filters (triggers reset to page 1)
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
    }, []);

    // Remove a specific filter
    const removeFilter = useCallback((key) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
        setPage(1);
    }, []);

    // Search tenants by name or slug
    const searchTenants = useCallback((searchTerm) => {
        if (searchTerm) {
            updateFilters({ search: searchTerm });
        } else {
            removeFilter('search');
        }
    }, [updateFilters, removeFilter]);

    // Filter by status
    const filterByStatus = useCallback((status) => {
        if (status) {
            updateFilters({ status });
        } else {
            removeFilter('status');
        }
    }, [updateFilters, removeFilter]);

    // Filter by subscription plan
    const filterByPlan = useCallback((plan) => {
        if (plan) {
            updateFilters({ subscription_plan: plan });
        } else {
            removeFilter('subscription_plan');
        }
    }, [updateFilters, removeFilter]);

    // Sort tenants
    const sortBy = useCallback((field, direction = 'desc') => {
        updateFilters({ ordering: `${direction === 'desc' ? '-' : ''}${field}` });
    }, [updateFilters]);

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    // Check if has next/previous page
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get current range display
    const range = {
        start: (page - 1) * pageSize + 1,
        end: Math.min(page * pageSize, total),
    };

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    return {
        // Data
        tenants,
        loading,
        error,
        total,
        page,
        pageSize,
        totalPages,
        filters,
        range,

        // Navigation
        goToPage,
        setItemsPerPage,
        hasNextPage,
        hasPrevPage,

        // Filtering
        updateFilters,
        clearFilters,
        removeFilter,
        searchTenants,
        filterByStatus,
        filterByPlan,

        // Sorting
        sortBy,

        // Actions
        refetch,
    };
};