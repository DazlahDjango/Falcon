import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIndividualDashboard,
    selectIndividualDashboard,
    selectDashboardLoading,
    selectDashboardError,
    updateDashboardTimestamp
} from '../../store/kpi';

const useIndividualDashboard = (year, month) => {
    const dispatch = useDispatch();
    
    const dashboard = useSelector(selectIndividualDashboard);
    const loading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    
    const loadDashboard = useCallback(() => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        dispatch(fetchIndividualDashboard(params));
    }, [dispatch, year, month]);
    
    const refresh = useCallback(() => {
        loadDashboard();
        dispatch(updateDashboardTimestamp());
    }, [loadDashboard, dispatch]);
    
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);
    
    return {
        dashboard,
        loading,
        error,
        refresh,
    };
};

export default useIndividualDashboard;