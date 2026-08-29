/**
 * Hook for cascading targets - Connects Redux Store & Target Service to UI
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCascadeMaps,
    createCascadeMap,
    cascadeToDepartment,
    getCascadeTree,
    rollbackCascadeMap,
    clearCascadeTree,
    clearCurrentMap,
    clearCascadeErrors,
    selectCascadeMaps,
    selectCascadeTree,
    selectCurrentMap,
    selectCascadeLoading,
    selectCascadeSubmitting,
    selectCascadeError,
} from '../../store/kpi';

const useTargetCascade = () => {
    const dispatch = useDispatch();
    
    const cascadeMaps = useSelector(selectCascadeMaps);
    const cascadeTree = useSelector(selectCascadeTree);
    const currentMap = useSelector(selectCurrentMap);
    const loading = useSelector(selectCascadeLoading);
    const submitting = useSelector(selectCascadeSubmitting);
    const error = useSelector(selectCascadeError);
    
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

    const clearTree = useCallback(() => {
        dispatch(clearCascadeTree());
    }, [dispatch]);

    const clearMap = useCallback(() => {
        dispatch(clearCurrentMap());
    }, [dispatch]);

    const resetError = useCallback(() => {
        dispatch(clearCascadeErrors());
    }, [dispatch]);
    
    return {
        cascadeMaps,
        cascadeTree,
        currentMap,
        loading,
        submitting,
        error,
        fetchCascadeMaps: getMaps,
        cascadeFromOrg,
        createCascadeMap: cascadeFromOrg,
        cascadeToDepartment: cascadeToDept,
        loadCascadeTree,
        rollbackCascadeMap: rollback,
        clearCascadeTree: clearTree,
        clearCurrentMap: clearMap,
        clearErrors: resetError,
    };
};

export default useTargetCascade;