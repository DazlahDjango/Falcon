import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchDepartmentTree,
    fetchDepartmentBranch,
    fetchDepartmentPath,
    fetchDepartmentSubtree,
    fetchDepartmentLCA,
    clearDepartmentTreeError,
    resetDepartmentTreeState,
} from '../../store/structure/slice/departmentTree.slice';
import {
    selectDepartmentTree,
    selectDepartmentTreeLoading,
    selectDepartmentTreeError,
} from '../../store/structure/selectors';

export const useDepartmentTree = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true } = options;

    const tree = useSelector(selectDepartmentTree);
    const isLoading = useSelector(selectDepartmentTreeLoading);
    const error = useSelector(selectDepartmentTreeError);

    const fetchFullTree = useCallback(() => {
        return dispatch(fetchDepartmentTree());
    }, [dispatch]);

    const fetchBranch = useCallback((departmentId) => {
        return dispatch(fetchDepartmentBranch(departmentId));
    }, [dispatch]);

    const fetchPath = useCallback((departmentId) => {
        return dispatch(fetchDepartmentPath(departmentId));
    }, [dispatch]);

    const fetchSubtree = useCallback((departmentId) => {
        return dispatch(fetchDepartmentSubtree(departmentId));
    }, [dispatch]);

    const fetchLCA = useCallback((deptA, deptB) => {
        return dispatch(fetchDepartmentLCA({ deptA, deptB }));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearDepartmentTreeError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetDepartmentTreeState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchFullTree();
        }
    }, [autoFetch, fetchFullTree]);

    return {
        tree,
        isLoading,
        error,
        fetchFullTree,
        fetchBranch,
        fetchPath,
        fetchSubtree,
        fetchLCA,
        clearError,
        reset,
    };
};

export default useDepartmentTree;