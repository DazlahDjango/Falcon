/**
 * Hook for user scores (nested resource)
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserScores,
    selectUserScores,
    selectScoreLoading
} from '../../store/kpi';

const useUserScores = (userId, params = {}) => {
    const dispatch = useDispatch();
    
    const scores = useSelector(state => selectUserScores(userId)(state));
    const loading = useSelector(selectScoreLoading);
    
    const loadScores = useCallback(() => {
        if (userId) {
            dispatch(fetchUserScores({ userId, params }));
        }
    }, [dispatch, userId, params]);
    
    useEffect(() => {
        loadScores();
    }, [loadScores]);
    
    return {
        scores: scores || [],
        loading,
        refresh: loadScores,
    };
};

export default useUserScores;