import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserKPIs,
    selectUserKPIs,
    selectKPILoading
} from '../../store/kpi';

const useUserKPIs = (userId, params = {}) => {
    const dispatch = useDispatch();
    
    const kpis = useSelector(state => selectUserKPIs(userId)(state));
    const loading = useSelector(selectKPILoading);
    
    const loadKPIs = useCallback(() => {
        if (userId) {
            dispatch(fetchUserKPIs({ userId, params }));
        }
    }, [dispatch, userId, params]);
    
    useEffect(() => {
        loadKPIs();
    }, [loadKPIs]);
    
    return {
        kpis: kpis || [],
        loading,
        refresh: loadKPIs,
    };
};

export default useUserKPIs;