import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCascadeMaps,
    createCascadeMap,
    cascadeToDepartment,
    getCascadeTree,
    rollbackCascadeMap,
    repairCascade,
    fetchContributors,
    fetchUserContributions,
    rollbackOrgCascade,
    verifyCascadeIntegrity,
    clearCascadeTree,
    clearCurrentMap,
    clearCascadeErrors,
    clearIntegrityReport,
    clearRepairResult,
    selectCascadeMaps,
    selectCascadeTree,
    selectCurrentMap,
    selectCascadeLoading,
    selectCascadeSubmitting,
    selectCascadeError,
    selectCascadeContributors,
    selectCascadeUserContributions,
    selectCascadeIntegrityReport,
    selectCascadeRepairResult,
} from '../../store/kpi';

const useTargetCascade = () => {
    const dispatch = useDispatch();
    
    const cascadeMaps = useSelector(selectCascadeMaps);
    const cascadeTree = useSelector(selectCascadeTree);
    const currentMap = useSelector(selectCurrentMap);
    const loading = useSelector(selectCascadeLoading);
    const submitting = useSelector(selectCascadeSubmitting);
    const error = useSelector(selectCascadeError);
    const contributors = useSelector(selectCascadeContributors);
    const userContributions = useSelector(selectCascadeUserContributions);
    const integrityReport = useSelector(selectCascadeIntegrityReport);
    const repairResult = useSelector(selectCascadeRepairResult);
    
    const getMaps = useCallback(async (params = {}) => {
        return dispatch(fetchCascadeMaps(params)).unwrap();
    }, [dispatch]);

    const cascadeFromOrg = useCallback(async (data) => {
        return dispatch(createCascadeMap(data)).unwrap();
    }, [dispatch]);
    
    const cascadeToDept = useCallback(async ({ deptTargetId, ruleId, userIds = [], weights = {} }) => {
        return dispatch(cascadeToDepartment({
            deptTargetId,
            ruleId,
            userIds,
            weights
        })).unwrap();
    }, [dispatch]);
    
    const loadCascadeTree = useCallback(async (orgTargetId) => {
        return dispatch(getCascadeTree(orgTargetId)).unwrap();
    }, [dispatch]);

    const rollback = useCallback(async (mapId) => {
        return dispatch(rollbackCascadeMap(mapId)).unwrap();
    }, [dispatch]);

    const repair = useCallback(async (kpiId, year) => {
        return dispatch(repairCascade({ kpiId, year })).unwrap();
    }, [dispatch]);

    const getContributorsList = useCallback(async (orgTargetId) => {
        return dispatch(fetchContributors(orgTargetId)).unwrap();
    }, [dispatch]);

    const getUserContributionsList = useCallback(async (userId, year) => {
        return dispatch(fetchUserContributions({ userId, year })).unwrap();
    }, [dispatch]);

    const rollbackOrg = useCallback(async (orgTargetId) => {
        return dispatch(rollbackOrgCascade(orgTargetId)).unwrap();
    }, [dispatch]);

    const verifyIntegrity = useCallback(async (orgTargetId) => {
        return dispatch(verifyCascadeIntegrity(orgTargetId)).unwrap();
    }, [dispatch]);

    const clearTree = useCallback(() => {
        dispatch(clearCascadeTree());
    }, [dispatch]);

    const clearMap = useCallback(() => {
        dispatch(clearCurrentMap());
    }, [dispatch]);

    const resetError = useCallback(() => {
        dispatch(clearCascadeErrors());
    }, [dispatch]);

    const resetIntegrityReport = useCallback(() => {
        dispatch(clearIntegrityReport());
    }, [dispatch]);

    const resetRepairResult = useCallback(() => {
        dispatch(clearRepairResult());
    }, [dispatch]);
    
    return {
        cascadeMaps,
        cascadeTree,
        currentMap,
        loading,
        submitting,
        error,
        contributors,
        userContributions,
        integrityReport,
        repairResult,
        fetchCascadeMaps: getMaps,
        cascadeFromOrg,
        createCascadeMap: cascadeFromOrg,
        cascadeToDepartment: cascadeToDept,
        loadCascadeTree,
        rollbackCascadeMap: rollback,
        repairCascade: repair,
        fetchContributors: getContributorsList,
        fetchUserContributions: getUserContributionsList,
        rollbackOrgCascade: rollbackOrg,
        verifyCascadeIntegrity: verifyIntegrity,
        clearCascadeTree: clearTree,
        clearCurrentMap: clearMap,
        clearErrors: resetError,
        clearIntegrityReport: resetIntegrityReport,
        clearRepairResult: resetRepairResult,
    };
};

export default useTargetCascade;