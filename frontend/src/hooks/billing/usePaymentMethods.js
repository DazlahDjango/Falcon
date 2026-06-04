import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod,
    setSelectedMethod, clearSelectedMethod, clearError,
} from '../../store/billing/slices/paymentMethodSlice';
import {
    selectAllPaymentMethods, selectDefaultPaymentMethod, selectPaymentMethodsLoading,
    selectPaymentMethodsError, selectActivePaymentMethods, selectCardPaymentMethods,
    selectHasPaymentMethod, selectExpiringCards,
} from '../../store/billing/selectors';

export const usePaymentMethods = (options = { autoFetch: true }) => {
    const dispatch = useDispatch();
    const paymentMethods = useSelector(selectAllPaymentMethods);
    const defaultMethod = useSelector(selectDefaultPaymentMethod);
    const loading = useSelector(selectPaymentMethodsLoading);
    const error = useSelector(selectPaymentMethodsError);
    const activeMethods = useSelector(selectActivePaymentMethods);
    const cardMethods = useSelector(selectCardPaymentMethods);
    const hasPaymentMethod = useSelector(selectHasPaymentMethod);
    const expiringCards = useSelector(selectExpiringCards);

    const fetchAll = useCallback(() => dispatch(fetchPaymentMethods()), [dispatch]);
    const add = useCallback((authorizationCode, email) => dispatch(addPaymentMethod({ authorizationCode, email })), [dispatch]);
    const remove = useCallback((id) => dispatch(deletePaymentMethod(id)), [dispatch]);
    const setDefault = useCallback((id) => dispatch(setDefaultPaymentMethod(id)), [dispatch]);
    const selectMethod = useCallback((method) => dispatch(setSelectedMethod(method)), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedMethod()), [dispatch]);
    const clearPaymentError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch) fetchAll(); }, [options.autoFetch, fetchAll]);

    return {
        paymentMethods, defaultMethod, loading, error, activeMethods, cardMethods,
        hasPaymentMethod, expiringCards, fetchAll, add, remove, setDefault,
        selectMethod, clearSelected, clearPaymentError,
    };
};

export default usePaymentMethods;