/**
 * Hook for managing scores
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchScores,
    fetchMyScores,
    fetchTeamScores,
    fetchScoreStatistics,
    selectScores,
    selectMyScores,
    selectTeamScores,
    selectScoreStatistics,
    selectScoreLoading
} from '../../store/kpi';

const useScores = (params = {}) => {
    const dispatch = useDispatch();
    
    const scores = useSelector(selectScores);
    const myScores = useSelector(selectMyScores);
    const teamScores = useSelector(selectTeamScores);
    const statistics = useSelector(selectScoreStatistics);
    const loading = useSelector(selectScoreLoading);
    
    const loadScores = useCallback(() => {
        dispatch(fetchScores(params));
    }, [dispatch, params]);
    
    const loadMyScores = useCallback(() => {
        dispatch(fetchMyScores(params));
    }, [dispatch, params]);
    
    const loadTeamScores = useCallback(() => {
        dispatch(fetchTeamScores(params));
    }, [dispatch, params]);
    
    const loadStatistics = useCallback(() => {
        dispatch(fetchScoreStatistics(params));
    }, [dispatch, params]);
    
    const refresh = useCallback(() => {
        loadScores();
        loadMyScores();
        loadTeamScores();
        loadStatistics();
    }, [loadScores, loadMyScores, loadTeamScores, loadStatistics]);
    
    useEffect(() => {
        refresh();
    }, [refresh]);
    
    return {
        scores,
        myScores,
        teamScores,
        statistics,
        loading,
        refresh,
        loadScores,
        loadMyScores,
        loadTeamScores,
        loadStatistics,
    };
};

export default useScores;