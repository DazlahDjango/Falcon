import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTeamScores,
    selectTeamScores,
    selectScoreLoading
} from '../../store/kpi';

const useTeamScores = (params = {}) => {
    const dispatch = useDispatch();
    
    const scores = useSelector(selectTeamScores);
    const loading = useSelector(selectScoreLoading);
    
    const loadScores = useCallback(() => {
        dispatch(fetchTeamScores(params));
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

export default useTeamScores;