import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchSections,
    fetchSectionById,
    fetchSectionUnits,
    createSection,
    updateSection,
    deleteSection,
    clearSectionError,
    clearSectionCurrent,
    setSectionFilters,
    setSectionPagination,
    resetSectionState,
} from '../../store/structure/slice/sectionslice';
import {
    selectSectionsItems,
    selectSectionsCurrent,
    selectSectionsLoading,
    selectSectionsError,
    selectSectionsTotal,
} from '../../store/structure/selectors';

export const useSections = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const isFirstRender = useRef(true);
    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectSectionsItems);
    const currentItem = useSelector(selectSectionsCurrent);
    const isLoading = useSelector(selectSectionsLoading);
    const error = useSelector(selectSectionsError);
    const totalCount = useSelector(selectSectionsTotal);

    const fetchAll = useCallback((fetchParams) => {
        const paramsToUse = fetchParams || params;
        return dispatch(fetchSections(paramsToUse));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchSectionById(id));
    }, [dispatch]);

    const fetchUnits = useCallback((id) => {
        return dispatch(fetchSectionUnits(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createSection(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateSection({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteSection(id));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearSectionError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearSectionCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setSectionFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setSectionPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetSectionState());
    }, [dispatch]);

    const refetch = useCallback((newParams) => {
        const fetchParams = newParams || params;
        prevParamsRef.current = fetchParams;
        return dispatch(fetchSections(fetchParams));
    }, [dispatch, params]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);
        
        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchSections(params));
        }
    }, [autoFetch, params, dispatch]);

    useEffect(() => {
        return () => {
            hasFetched.current = false;
            isFirstRender.current = true;
        };
    }, []);

    const forceFetch = useCallback(() => {
        hasFetched.current = true;
        return dispatch(fetchSections(params));
    }, [dispatch, params]);

    return {
        items,
        currentItem,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchUnits,
        create,
        update,
        remove,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
        refetch,
        forceFetch,
        _hasFetched: hasFetched.current,
    };
};

export default useSections;