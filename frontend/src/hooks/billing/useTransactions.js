import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTransactions, fetchTransactionById, fetchTransactionSummary,
    verifyTransaction, refundTransaction, fetchAdminTransactionStats,
    setFilters, clearFilters, setPagination, clearSelectedTransaction, clearError,
} from '../../store/billing/slices/transactionSlice';
import {
    selectAllTransactions, selectSelectedTransaction, selectTransactionSummary,
    selectTransactionFilters, selectTransactionPagination, selectTransactionsLoading,
    selectTransactionsError, selectTransactionAdminStats,
} from '../../store/billing/selectors';

export const useTransactions = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const hasFetched = useRef(false);
    const transactions = useSelector(selectAllTransactions);
    const selectedTransaction = useSelector(selectSelectedTransaction);
    const summary = useSelector(selectTransactionSummary);
    const filters = useSelector(selectTransactionFilters);
    const pagination = useSelector(selectTransactionPagination) || { page: 1, pageSize: 20, total: 0 };
    const loading = useSelector(selectTransactionsLoading);
    const error = useSelector(selectTransactionsError);
    const adminStats = useSelector(selectTransactionAdminStats);

    const fetchAll = useCallback((params) => dispatch(fetchTransactions(params)), [dispatch]);
    const fetchById = useCallback((id) => dispatch(fetchTransactionById(id)), [dispatch]);
    const fetchSummary = useCallback(() => dispatch(fetchTransactionSummary()), [dispatch]);
    const verify = useCallback((reference) => dispatch(verifyTransaction(reference)), [dispatch]);
    const refund = useCallback((id, amount = null) => dispatch(refundTransaction({ id, amount })), [dispatch]);
    const fetchAdminStats = useCallback((year = null) => dispatch(fetchAdminTransactionStats(year)), [dispatch]);
    const applyFilters = useCallback((newFilters) => dispatch(setFilters(newFilters)), [dispatch]);
    const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);
    const setPage = useCallback((page) => dispatch(setPagination({ page })), [dispatch]);
    const setPageSize = useCallback((pageSize) => dispatch(setPagination({ pageSize, page: 1 })), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedTransaction()), [dispatch]);
    const clearTransactionsError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && !hasFetched.current) {
            hasFetched.current = true;
            const page = pagination?.page || 1;
            const pageSize = pagination?.pageSize || 20;
            fetchAll({ page, pageSize, filters });
        }
    }, [options.autoFetch]);

    return {
        transactions, selectedTransaction, summary, filters, pagination, loading, error, adminStats,
        fetchAll, fetchById, fetchSummary, verify, refund, fetchAdminStats,
        applyFilters, resetFilters, setPage, setPageSize, clearSelected, clearTransactionsError,
    };
};

export default useTransactions;