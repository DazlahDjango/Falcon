/**
 * Hook for rejection reasons
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRejectionReasons,
    selectRejectionReasons,
    selectValidationLoading
} from '../../store/kpi';

const useRejectionReasons = () => {
    const dispatch = useDispatch();
    
    const reasons = useSelector(selectRejectionReasons);
    const loading = useSelector(selectValidationLoading);
    
    const loadReasons = useCallback(() => {
        dispatch(fetchRejectionReasons({ is_active: true }));
    }, [dispatch]);
    
    useEffect(() => {
        loadReasons();
    }, [loadReasons]);
    
    return {
        reasons: reasons || [],
        loading,
        refresh: loadReasons,
        getReasonsByCategory: (category) => reasons.filter(r => r.category === category),
    };
};

export default useRejectionReasons;