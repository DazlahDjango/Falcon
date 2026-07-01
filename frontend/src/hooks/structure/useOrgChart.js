import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchOrgChartTree,
    fetchOrgChartPreview,
    exportOrgChartJson,
    exportOrgChartCsv,
    clearOrgChartError,
    resetOrgChartState,
} from '../../store/structure/slice/orgChartSlice';
import {
    selectOrgChartTree,
    selectOrgChartPreview,
    selectOrgChartLoading,
    selectOrgChartError,
} from '../../store/structure/selectors';

export const useOrgChart = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true } = options;

    const tree = useSelector(selectOrgChartTree);
    const preview = useSelector(selectOrgChartPreview);
    const isLoading = useSelector(selectOrgChartLoading);
    const error = useSelector(selectOrgChartError);

    const fetchTree = useCallback(() => {
        return dispatch(fetchOrgChartTree());
    }, [dispatch]);

    const fetchPreview = useCallback(() => {
        return dispatch(fetchOrgChartPreview());
    }, [dispatch]);

    const exportJson = useCallback((params) => {
        return dispatch(exportOrgChartJson(params));
    }, [dispatch]);

    const exportCsv = useCallback((params) => {
        return dispatch(exportOrgChartCsv(params));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearOrgChartError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetOrgChartState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchTree();
        }
    }, [autoFetch, fetchTree]);

    return {
        tree,
        preview,
        isLoading,
        error,
        fetchTree,
        fetchPreview,
        exportJson,
        exportCsv,
        clearError,
        reset,
    };
};

export default useOrgChart;