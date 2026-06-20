import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserTargets,
    selectUserTargets,
    selectTargetLoading
} from '../../store/kpi';

const useUserTargets = (userId, params = {}) => {
    const dispatch = useDispatch();
    
    const targets = useSelector(state => selectUserTargets(userId)(state));
    const loading = useSelector(selectTargetLoading);
    
    const loadTargets = useCallback(() => {
        if (userId) {
            dispatch(fetchUserTargets({ userId, params }));
        }
    }, [dispatch, userId, params]);
    
    useEffect(() => {
        loadTargets();
    }, [loadTargets]);
    
    return {
        targets: targets || [],
        loading,
        refresh: loadTargets,
    };
};

export default useUserTargets;