import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAggregatedScores,
    fetchOrganizationScores,
    fetchDepartmentRanking,
    selectAggregatedScores,
    selectOrganizationScores,
    selectDepartmentRanking,
    selectScoreLoading
} from '../../store/kpi';

const useAggregatedScores = (params = {}) => {
    const dispatch = useDispatch();
    
    const aggregatedScores = useSelector(selectAggregatedScores);
    const organizationScores = useSelector(selectOrganizationScores);
    const departmentRanking = useSelector(selectDepartmentRanking);
    const loading = useSelector(selectScoreLoading);
    
    const loadAggregatedScores = useCallback(() => {
        dispatch(fetchAggregatedScores(params));
    }, [dispatch, params]);
    
    const loadOrganizationScores = useCallback(() => {
        dispatch(fetchOrganizationScores(params));
    }, [dispatch, params]);
    
    const loadDepartmentRanking = useCallback(() => {
        dispatch(fetchDepartmentRanking(params));
    }, [dispatch, params]);
    
    useEffect(() => {
        loadAggregatedScores();
        loadOrganizationScores();
        loadDepartmentRanking();
    }, [loadAggregatedScores, loadOrganizationScores, loadDepartmentRanking]);
    
    return {
        aggregatedScores: aggregatedScores || [],
        organizationScores,
        departmentRanking: departmentRanking || [],
        loading,
        refresh: () => {
            loadAggregatedScores();
            loadOrganizationScores();
            loadDepartmentRanking();
        },
    };
};

export default useAggregatedScores;