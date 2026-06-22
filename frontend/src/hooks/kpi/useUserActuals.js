/**
 * Hook for user actuals (nested resource)
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserActuals,
    selectUserActuals,
    selectActualLoading
} from '../../store/kpi';

const useUserActuals = (userId, params = {}) => {
    const dispatch = useDispatch();
    
    const actuals = useSelector(state => selectUserActuals(userId)(state));
    const loading = useSelector(selectActualLoading);
    
    const loadActuals = useCallback(() => {
        if (userId) {
            dispatch(fetchUserActuals({ userId, params }));
        }
    }, [dispatch, userId, params]);
    
    useEffect(() => {
        loadActuals();
    }, [loadActuals]);
    
    return {
        actuals: actuals || [],
        loading,
        refresh: loadActuals,
    };
};

export default useUserActuals;