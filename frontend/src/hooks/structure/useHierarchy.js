import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchHierarchyVersions,
    fetchHierarchyVersionById,
    fetchCurrentHierarchyVersion,
    fetchHierarchyHistory,
    validateHierarchy,
    captureHierarchySnapshot,
    autoCaptureHierarchy,
    restoreHierarchyVersion,
    diffHierarchyVersions,
    clearHierarchyError,
    clearHierarchyCurrent,
    resetHierarchyState,
} from '../../store/structure/slice/hierarchySlice';
import {
    selectHierarchyItems,
    selectHierarchyCurrent,
    selectHierarchyCurrentVersion,
    selectHierarchyHistory,
    selectHierarchyValidation,
    selectHierarchyLoading,
    selectHierarchyError,
    selectHierarchyTotal,
} from '../../store/structure/selectors';

export const useHierarchy = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectHierarchyItems);
    const currentItem = useSelector(selectHierarchyCurrent);
    const currentVersion = useSelector(selectHierarchyCurrentVersion);
    const history = useSelector(selectHierarchyHistory);
    const validationResult = useSelector(selectHierarchyValidation);
    const isLoading = useSelector(selectHierarchyLoading);
    const error = useSelector(selectHierarchyError);
    const totalCount = useSelector(selectHierarchyTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchHierarchyVersions(fetchParams || params));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchHierarchyVersionById(id));
    }, [dispatch]);

    const fetchCurrent = useCallback(() => {
        return dispatch(fetchCurrentHierarchyVersion());
    }, [dispatch]);

    const fetchHistory = useCallback((limit) => {
        return dispatch(fetchHierarchyHistory(limit));
    }, [dispatch]);

    const validate = useCallback(() => {
        return dispatch(validateHierarchy());
    }, [dispatch]);

    const capture = useCallback((data) => {
        return dispatch(captureHierarchySnapshot(data));
    }, [dispatch]);

    const autoCapture = useCallback(() => {
        return dispatch(autoCaptureHierarchy());
    }, [dispatch]);

    const restore = useCallback((id) => {
        return dispatch(restoreHierarchyVersion(id));
    }, [dispatch]);

    const diff = useCallback((id, compareToId) => {
        return dispatch(diffHierarchyVersions({ id, compareToId }));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearHierarchyError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearHierarchyCurrent());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetHierarchyState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

    return {
        items,
        currentItem,
        currentVersion,
        history,
        validationResult,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchCurrent,
        fetchHistory,
        validate,
        capture,
        autoCapture,
        restore,
        diff,
        clearError,
        clearCurrent,
        reset,
    };
};

export default useHierarchy;