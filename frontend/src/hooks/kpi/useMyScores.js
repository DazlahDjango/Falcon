import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMyScores,
    selectMyScores,
    selectScoreLoading
} from '../../store/kpi';

const useMyScores = (params = {}) => {
    const dispatch = useDispatch();
    
    const scores = useSelector(selectMyScores);
    const loading = useSelector(selectScoreLoading);
    
    const loadScores = useCallback(() => {
        dispatch(fetchMyScores(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadScores();
    }, [loadScores]);
    
    return {
        scores: scores || [],
        loading,
        refresh: loadScores,
    };
};

export default useMyScores;