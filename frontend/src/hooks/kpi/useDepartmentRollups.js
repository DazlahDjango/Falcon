/**
 * Hook for department rollups
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDepartmentRollups,
    selectDepartmentRollups,
    selectAnalyticsLoading
} from '../../store/kpi';

const useDepartmentRollups = (params = {}) => {
    const dispatch = useDispatch();
    
    const rollups = useSelector(selectDepartmentRollups);
    const loading = useSelector(selectAnalyticsLoading);
    
    const loadRollups = useCallback(() => {
        dispatch(fetchDepartmentRollups(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadRollups();
    }, [loadRollups]);
    
    return {
        rollups: rollups || [],
        loading,
        refresh: loadRollups,
    };
};

export default useDepartmentRollups;