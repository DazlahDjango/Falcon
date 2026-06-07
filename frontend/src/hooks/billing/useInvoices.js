import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchInvoices, fetchInvoiceById, fetchInvoiceSummary,
    downloadInvoice, payInvoice, sendInvoiceEmail,
    setFilters, clearFilters, setPagination, clearSelectedInvoice, clearError,
} from '../../store/billing/slices/invoiceSlice';
import {
    selectAllInvoices, selectSelectedInvoice, selectInvoiceSummary,
    selectInvoiceFilters, selectInvoicePagination, selectInvoicesLoading,
    selectInvoicesError,
} from '../../store/billing/selectors';

export const useInvoices = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const hasFetched = useRef(false);
    const invoices = useSelector(selectAllInvoices);
    const selectedInvoice = useSelector(selectSelectedInvoice);
    const summary = useSelector(selectInvoiceSummary);
    const filters = useSelector(selectInvoiceFilters);
    const pagination = useSelector(selectInvoicePagination);
    const loading = useSelector(selectInvoicesLoading);
    const error = useSelector(selectInvoicesError);

    const fetchAll = useCallback((params) => dispatch(fetchInvoices(params)), [dispatch]);
    const fetchById = useCallback((id) => dispatch(fetchInvoiceById(id)), [dispatch]);
    const fetchSummary = useCallback(() => dispatch(fetchInvoiceSummary()), [dispatch]);
    const download = useCallback((id, format = 'pdf') => dispatch(downloadInvoice({ id, format })), [dispatch]);
    const pay = useCallback((id, paymentMethodId = null) => dispatch(payInvoice({ id, paymentMethodId })), [dispatch]);
    const sendEmail = useCallback((id) => dispatch(sendInvoiceEmail(id)), [dispatch]);
    const applyFilters = useCallback((newFilters) => dispatch(setFilters(newFilters)), [dispatch]);
    const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);
    const setPage = useCallback((page) => dispatch(setPagination({ page })), [dispatch]);
    const setPageSize = useCallback((pageSize) => dispatch(setPagination({ pageSize, page: 1 })), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedInvoice()), [dispatch]);
    const clearInvoicesError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { 
        if (options.autoFetch && !hasFetched.current) {
            hasFetched.current = true;
            fetchAll({ page: pagination?.page || 1, pageSize: pagination?.pageSize || 20, filters });
        }
    }, [options.autoFetch]);

    return {
        invoices, selectedInvoice, summary, filters, pagination, loading, error,
        fetchAll, fetchById, fetchSummary, download, pay, sendEmail,
        applyFilters, resetFilters, setPage, setPageSize, clearSelected, clearInvoicesError,
    };
};

export default useInvoices;