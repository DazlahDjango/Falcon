import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRedAlerts,
    fetchMyRedAlerts,
    selectRedAlerts,
    selectMyRedAlerts,
    selectScoreLoading
} from '../../store/kpi';

const useRedAlerts = () => {
    const dispatch = useDispatch();
    
    const redAlerts = useSelector(selectRedAlerts);
    const myRedAlerts = useSelector(selectMyRedAlerts);
    const loading = useSelector(selectScoreLoading);
    
    const loadRedAlerts = useCallback(() => {
        dispatch(fetchRedAlerts());
    }, [dispatch]);
    
    const loadMyRedAlerts = useCallback(() => {
        dispatch(fetchMyRedAlerts());
    }, [dispatch]);
    
    useEffect(() => {
        loadRedAlerts();
        loadMyRedAlerts();
    }, [loadRedAlerts, loadMyRedAlerts]);
    
    return {
        redAlerts: redAlerts || [],
        myRedAlerts: myRedAlerts || [],
        loading,
        refresh: () => {
            loadRedAlerts();
            loadMyRedAlerts();
        },
    };
};

export default useRedAlerts;