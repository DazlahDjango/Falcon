import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
    const { autoFetch = true, params = {} } = options;

    const items = useSelector(selectSectionsItems);
    const currentItem = useSelector(selectSectionsCurrent);
    const isLoading = useSelector(selectSectionsLoading);
    const error = useSelector(selectSectionsError);
    const totalCount = useSelector(selectSectionsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchSections(fetchParams || params));
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

    useEffect(() => {
        if (autoFetch) {
            fetchAll(params);
        }
    }, [autoFetch, fetchAll, params]);

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
    };
};

export default useSections;