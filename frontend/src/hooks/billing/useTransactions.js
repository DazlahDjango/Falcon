import { useState, useEffect, useCallback, useMemo } from 'react';
import { TransactionService } from '../../services/billing';
import { TRANSACTION_STATUS, TRANSACTION_TYPES, BILLING_PAGINATION } from '../../config/constants/billingConstants';

export const useTransactions = (options = {}) => {
    const {
        autoFetch = true,
        pageSize = BILLING_PAGINATION.DEFAULT_PAGE_SIZE,
        initialFilters = {},
    } = options;

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState(initialFilters);
    const [summary, setSummary] = useState(null);
    const [verifying, setVerifying] = useState(false);

    // Fetch transactions
    const fetchTransactions = useCallback(async (page = currentPage, newFilters = filters) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                page_size: pageSize,
                ...newFilters,
            };

            const response = await TransactionService.getTransactions(params);
            const data = response?.data || [];
            
            setTransactions(data);
            setTotalCount(response?.count || data.length);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch transactions');
            console.error('[useTransactions] Error:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    // Fetch transaction summary
    const fetchSummary = useCallback(async () => {
        try {
            const summaryData = await TransactionService.getTransactionSummary();
            setSummary(summaryData);
            return summaryData;
        } catch (err) {
            console.error('[useTransactions] Error fetching summary:', err);
            return null;
        }
    }, []);

    // Verify a transaction
    const verifyTransaction = useCallback(async (reference) => {
        setVerifying(true);
        setError(null);

        try {
            const response = await TransactionService.verifyTransaction(reference);
            const result = response?.data;
            
            // Refresh list if verification changed status
            if (result?.verified) {
                await fetchTransactions();
                await fetchSummary();
            }
            
            return result;
        } catch (err) {
            setError(err.message || 'Failed to verify transaction');
            console.error('[useTransactions] Verification error:', err);
            throw err;
        } finally {
            setVerifying(false);
        }
    }, [fetchTransactions, fetchSummary]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setCurrentPage(1);
    }, []);

    // Change page
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Get transaction by reference
    const getByReference = useCallback((reference) => {
        return transactions.find(t => t.reference === reference);
    }, [transactions]);

    // Get transactions by status
    const getByStatus = useCallback((status) => {
        return transactions.filter(t => t.status === status);
    }, [transactions]);

    // Get transactions by type
    const getByType = useCallback((type) => {
        return transactions.filter(t => t.transaction_type === type);
    }, [transactions]);

    // Auto-fetch
    useEffect(() => {
        if (autoFetch) {
            fetchTransactions();
            fetchSummary();
        }
    }, [autoFetch, currentPage, filters, fetchTransactions, fetchSummary]);

    // Memoized values
    const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
    
    const successfulTransactions = useMemo(() => {
        return transactions.filter(t => t.status === TRANSACTION_STATUS.SUCCESS);
    }, [transactions]);
    
    const failedTransactions = useMemo(() => {
        return transactions.filter(t => t.status === TRANSACTION_STATUS.FAILED);
    }, [transactions]);
    
    const pendingTransactions = useMemo(() => {
        return transactions.filter(t => t.status === TRANSACTION_STATUS.PENDING);
    }, [transactions]);
    
    const refundedTransactions = useMemo(() => {
        return transactions.filter(t => t.status === TRANSACTION_STATUS.REFUNDED);
    }, [transactions]);
    
    const subscriptionTransactions = useMemo(() => {
        return transactions.filter(t => t.transaction_type === TRANSACTION_TYPES.SUBSCRIPTION || 
                                        t.transaction_type === TRANSACTION_TYPES.RENEWAL);
    }, [transactions]);
    
    const totalRevenue = useMemo(() => {
        return successfulTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    }, [successfulTransactions]);
    
    const totalRevenueDisplay = useMemo(() => {
        if (!totalRevenue) return 'KES 0.00';
        return `KES ${(totalRevenue / 100).toFixed(2)}`;
    }, [totalRevenue]);

    const successRate = useMemo(() => {
        if (transactions.length === 0) return 0;
        return (successfulTransactions.length / transactions.length) * 100;
    }, [transactions, successfulTransactions]);

    return {
        // State
        transactions,
        loading,
        error,
        summary,
        totalCount,
        currentPage,
        totalPages,
        filters,
        verifying,
        
        // Computed
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        refundedTransactions,
        subscriptionTransactions,
        totalRevenue,
        totalRevenueDisplay,
        successRate,
        hasTransactions: transactions.length > 0,
        
        // Actions
        fetchTransactions,
        fetchSummary,
        verifyTransaction,
        updateFilters,
        clearFilters,
        goToPage,
        getByReference,
        getByStatus,
        getByType,
    };
};

export default useTransactions;