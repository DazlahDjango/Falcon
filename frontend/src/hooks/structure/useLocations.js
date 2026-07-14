import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import {
    fetchLocations,
    fetchLocationById,
    fetchHeadquarters,
    fetchLocationStats,
    fetchLocationSubLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    updateLocationOccupancy,
    clearLocationError,
    clearLocationCurrent,
    setLocationFilters,
    setLocationPagination,
    resetLocationState,
} from '../../store/structure/slice/locationSlice';
import {
    selectLocationsItems,
    selectLocationsCurrent,
    selectLocationsHeadquarters,
    selectLocationsStats,
    selectLocationsLoading,
    selectLocationsError,
    selectLocationsTotal,
} from '../../store/structure/selectors';

export const useLocations = (options = {}) => {
    const dispatch = useDispatch();
    const { autoFetch = true, params: initialParams = {} } = options;

    const hasFetched = useRef(false);
    const prevParamsRef = useRef(initialParams);

    const params = useMemo(() => initialParams, [
        JSON.stringify(initialParams)
    ]);

    const items = useSelector(selectLocationsItems);
    const currentItem = useSelector(selectLocationsCurrent);
    const headquarters = useSelector(selectLocationsHeadquarters);
    const stats = useSelector(selectLocationsStats);
    const isLoading = useSelector(selectLocationsLoading);
    const error = useSelector(selectLocationsError);
    const totalCount = useSelector(selectLocationsTotal);

    const fetchAll = useCallback((fetchParams) => {
        return dispatch(fetchLocations(fetchParams || params));
    }, [dispatch, params]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchLocationById(id));
    }, [dispatch]);

    const fetchHeadquarters = useCallback(() => {
        return dispatch(fetchHeadquarters());
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        return dispatch(fetchLocationStats());
    }, [dispatch]);

    const fetchSubLocations = useCallback((id) => {
        return dispatch(fetchLocationSubLocations(id));
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createLocation(data));
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateLocation({ id, data }));
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteLocation(id));
    }, [dispatch]);

    const updateOccupancy = useCallback((id, occupancy) => {
        return dispatch(updateLocationOccupancy({ id, occupancy }));
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearLocationError());
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearLocationCurrent());
    }, [dispatch]);

    const setFilters = useCallback((filters) => {
        dispatch(setLocationFilters(filters));
    }, [dispatch]);

    const setPagination = useCallback((pagination) => {
        dispatch(setLocationPagination(pagination));
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetLocationState());
    }, [dispatch]);

    useEffect(() => {
        if (!autoFetch) {
            return;
        }

        const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(params);

        if (!hasFetched.current || paramsChanged) {
            hasFetched.current = true;
            prevParamsRef.current = params;
            dispatch(fetchLocations(params));
        }
    }, [autoFetch, params, dispatch]);

    return {
        items,
        currentItem,
        headquarters,
        stats,
        isLoading,
        error,
        totalCount,
        fetchAll,
        fetchById,
        fetchHeadquarters,
        fetchStats,
        fetchSubLocations,
        create,
        update,
        remove,
        updateOccupancy,
        clearError,
        clearCurrent,
        setFilters,
        setPagination,
        reset,
    };
};

export default useLocations;