import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserKPIs,
    selectUserKPIs,
    selectKPILoading
} from '../../store/kpi';
import { useAuthContext } from '../../contexts/accounts/AuthContext';

const useUserKPIs = (userId, params = {}) => {
    const dispatch = useDispatch();
    const { user } = useAuthContext();
    const targetUserId = userId || user?.id;
    
    const kpis = useSelector(state => selectUserKPIs(targetUserId)(state));
    const loading = useSelector(selectKPILoading);
    
    const loadKPIs = useCallback(() => {
        dispatch(fetchUserKPIs({ userId: targetUserId, params }));
    }, [dispatch, targetUserId, params]);
    
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