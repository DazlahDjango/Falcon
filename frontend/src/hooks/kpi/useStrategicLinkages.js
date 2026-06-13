/**
 * Hook for managing strategic linkages
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStrategicLinkages,
    createStrategicLinkage,
    deleteStrategicLinkage,
    selectStrategicLinkages,
    selectKPILoading
} from '../../store/kpi';

const useStrategicLinkages = (kpiId) => {
    const dispatch = useDispatch();
    
    const linkages = useSelector(selectStrategicLinkages);
    const loading = useSelector(selectKPILoading);
    
    const loadLinkages = useCallback(() => {
        if (kpiId) {
            dispatch(fetchStrategicLinkages({ kpiId }));
        }
    }, [dispatch, kpiId]);
    
    const add = useCallback(async (data) => {
        return dispatch(createStrategicLinkage({ kpiId, data })).unwrap();
    }, [dispatch, kpiId]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteStrategicLinkage(id)).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadLinkages();
    }, [loadLinkages]);
    
    return {
        linkages,
        loading,
        add,
        remove,
        refresh: loadLinkages,
    };
};

export default useStrategicLinkages;