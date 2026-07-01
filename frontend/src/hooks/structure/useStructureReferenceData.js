import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
    fetchReferenceData,
    fetchReferenceCounts,
    fetchReferenceOrgUnits,
    fetchReferenceUsers,
    clearReferenceDataError,
    resetReferenceDataState,
} from '../../store/structure/slice/referenceDataSlice';
import {
    selectReferenceDataAll,
    selectReferenceCounts,
    selectReferenceOrgUnits,
    selectReferenceUsers,
    selectReferenceLoading,
    selectReferenceError,
} from '../../store/structure/selectors';

export const useStructureReferenceData = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, include = ['counts', 'org_units', 'users'] } = options;

    const data = useSelector(selectReferenceDataAll);
    const counts = useSelector(selectReferenceCounts);
    const orgUnits = useSelector(selectReferenceOrgUnits);
    const users = useSelector(selectReferenceUsers);
    const isLoading = useSelector(selectReferenceLoading);
    const error = useSelector(selectReferenceError);

    const fetch = useCallback((includeParams) => {
        return dispatch(fetchReferenceData(includeParams || include));
    }, [dispatch, include]);

    const fetchCounts = useCallback(() => {
        return dispatch(fetchReferenceCounts());
    }, [dispatch]);

    const fetchOrgUnits = useCallback(() => {
        return dispatch(fetchReferenceOrgUnits());
    }, [dispatch]);

    const fetchUsers = useCallback(() => {
        return dispatch(fetchReferenceUsers());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearReferenceDataError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetReferenceDataState());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetch(include);
        }
    }, [autoFetch, fetch, include]);

    return {
        data,
        counts,
        orgUnits,
        users,
        isLoading,
        error,
        fetch,
        fetchCounts,
        fetchOrgUnits,
        fetchUsers,
        clearError,
        reset,
    };
};

export default useStructureReferenceData;