import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvoiceById, downloadInvoice, payInvoice, sendInvoiceEmail, clearSelectedInvoice, clearError } from '../../store/billing/slices/invoiceSlice';
import { selectSelectedInvoice, selectInvoicesLoading, selectInvoicesError } from '../../store/billing/selectors';

export const useInvoice = (id = null, options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const invoice = useSelector(selectSelectedInvoice);
    const loading = useSelector(selectInvoicesLoading);
    const error = useSelector(selectInvoicesError);

    const fetchById = useCallback((invoiceId) => dispatch(fetchInvoiceById(invoiceId)), [dispatch]);
    const download = useCallback((invoiceId, format = 'pdf') => dispatch(downloadInvoice({ id: invoiceId, format })), [dispatch]);
    const pay = useCallback((invoiceId, paymentMethodId = null) => dispatch(payInvoice({ id: invoiceId, paymentMethodId })), [dispatch]);
    const sendEmail = useCallback((invoiceId) => dispatch(sendInvoiceEmail(invoiceId)), [dispatch]);
    const clear = useCallback(() => dispatch(clearSelectedInvoice()), [dispatch]);
    const clearInvoiceError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch && id) fetchById(id); }, [options.autoFetch, id, fetchById]);

    return { invoice, loading, error, fetchById, download, pay, sendEmail, clear, clearInvoiceError };
};

export default useInvoice;