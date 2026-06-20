/**
 * Hook for pending validations (manager view)
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPendingValidations,
    fetchPendingSummary,
    selectPendingValidations,
    selectPendingSummary,
    selectValidationLoading
} from '../../store/kpi';

const usePendingValidations = () => {
    const dispatch = useDispatch();
    
    const pendingValidations = useSelector(selectPendingValidations);
    const pendingSummary = useSelector(selectPendingSummary);
    const loading = useSelector(selectValidationLoading);
    
    const loadPendingValidations = useCallback(() => {
        dispatch(fetchPendingValidations());
    }, [dispatch]);
    
    const loadPendingSummary = useCallback(() => {
        dispatch(fetchPendingSummary());
    }, [dispatch]);
    
    useEffect(() => {
        loadPendingValidations();
        loadPendingSummary();
    }, [loadPendingValidations, loadPendingSummary]);
    
    return {
        pendingValidations: pendingValidations || [],
        pendingSummary,
        loading,
        refresh: () => {
            loadPendingValidations();
            loadPendingSummary();
        },
    };
};

export default usePendingValidations;