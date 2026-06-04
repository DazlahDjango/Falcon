import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionById, verifyTransaction, refundTransaction, clearSelectedTransaction, clearError } from '../../store/billing/slices/transactionSlice';
import { selectSelectedTransaction, selectTransactionsLoading, selectTransactionsError } from '../../store/billing/selectors';

export const useTransaction = (id = null, options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const transaction = useSelector(selectSelectedTransaction);
    const loading = useSelector(selectTransactionsLoading);
    const error = useSelector(selectTransactionsError);

    const fetchById = useCallback((transactionId) => dispatch(fetchTransactionById(transactionId)), [dispatch]);
    const verify = useCallback((reference) => dispatch(verifyTransaction(reference)), [dispatch]);
    const refund = useCallback((transactionId, amount = null) => dispatch(refundTransaction({ id: transactionId, amount })), [dispatch]);
    const clear = useCallback(() => dispatch(clearSelectedTransaction()), [dispatch]);
    const clearTransactionError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch && id) fetchById(id); }, [options.autoFetch, id, fetchById]);

    return { transaction, loading, error, fetchById, verify, refund, clear, clearTransactionError };
};

export default useTransaction;