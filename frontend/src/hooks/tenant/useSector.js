// hooks/tenant/useSector.js
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSectors,
    fetchSector,
    createSector,
    updateSector,
    deleteSector,
    toggleSectorActive,
    clearCurrentSector,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllSectors,
} from '../../store/tenant/slice/sector.slice';

import {
    selectSectors,
    selectCurrentSector,
    selectSectorLoading,
    selectSectorDetailsLoading,
    selectSectorSubmitting,
    selectSectorError,
    selectSectorToggleResult,
    selectSectorPagination,
    selectSectorPage,
    selectSectorTotal,
    selectSectorTotalPages,
    selectSectorFilters,
    selectSectorById,
    selectSectorByCode,
    selectActiveSectors,
    selectInactiveSectors,
    selectSectorsByType,
    selectCommercialSectors,
    selectNgoSectors,
    selectPublicSectors,
    selectConsultingSectors,
    selectSectorCount,
    selectActiveSectorCount,
    selectHasSectors,
    selectIsSectorLoading,
    selectHasSectorError,
    selectSectorOptions,
    selectActiveSectorOptions,
    selectSectorTypeOptions,
} from '../../store/tenant/selectors/sector.selectors';

export const useSectors = (options = {}) => {
    const {
        autoFetch = true,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const sectors = useSelector(selectSectors);
    const currentSector = useSelector(selectCurrentSector);
    const loading = useSelector(selectSectorLoading);
    const loadingDetails = useSelector(selectSectorDetailsLoading);
    const submitting = useSelector(selectSectorSubmitting);
    const error = useSelector(selectSectorError);
    const toggleResult = useSelector(selectSectorToggleResult);
    const pagination = useSelector(selectSectorPagination);
    const pageNum = useSelector(selectSectorPage);
    const total = useSelector(selectSectorTotal);
    const totalPages = useSelector(selectSectorTotalPages);
    const filters = useSelector(selectSectorFilters);
    const count = useSelector(selectSectorCount);
    const activeCount = useSelector(selectActiveSectorCount);
    const hasSectors = useSelector(selectHasSectors);
    const isLoading = useSelector(selectIsSectorLoading);
    const hasError = useSelector(selectHasSectorError);
    const sectorOptions = useSelector(selectSectorOptions);
    const activeSectorOptions = useSelector(selectActiveSectorOptions);
    const sectorTypeOptions = useSelector(selectSectorTypeOptions);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize,
            ...params,
        };
        console.log('🟡 fetchList called with mergedParams:', mergedParams);
        return dispatch(fetchSectors(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSize]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(fetchSector(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Sector data is required'));
        if (!data.name) return Promise.reject(new Error('Sector name is required'));
        if (!data.code) return Promise.reject(new Error('Sector code is required'));
        if (!data.sector_type) return Promise.reject(new Error('Sector type is required'));
        return dispatch(createSector(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Sector ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateSector({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(deleteSector(id)).unwrap();
    }, [dispatch]);

    const toggleActive = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(toggleSectorActive(id)).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setPagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentSector());
    }, [dispatch]);

    const clearAllErrors = useCallback(() => {
        dispatch(clearErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllSectors());
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectSectorById(state, id));
    }, []);

    const getByCode = useCallback((code) => {
        return useSelector((state) => selectSectorByCode(state, code));
    }, []);

    const getActive = useCallback(() => {
        return useSelector(selectActiveSectors);
    }, []);

    const getInactive = useCallback(() => {
        return useSelector(selectInactiveSectors);
    }, []);

    const getByType = useCallback((type) => {
        return useSelector((state) => selectSectorsByType(state, type));
    }, []);

    const getCommercial = useCallback(() => {
        return useSelector(selectCommercialSectors);
    }, []);

    const getNgo = useCallback(() => {
        return useSelector(selectNgoSectors);
    }, []);

    const getPublic = useCallback(() => {
        return useSelector(selectPublicSectors);
    }, []);

    const getConsulting = useCallback(() => {
        return useSelector(selectConsultingSectors);
    }, []);

    useEffect(() => {
        console.log('🟡 useSectors effect triggered');
        console.log('🟡 autoFetch:', autoFetch);
        console.log('🟡 fetchCalled.current:', fetchCalled.current);
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            console.log('🟡 Calling fetchList with initialFilters:', initialFilters);
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    return useMemo(() => ({
        sectors,
        currentSector,
        loading,
        loadingDetails,
        submitting,
        error,
        toggleResult,
        pagination,
        page: pageNum,
        pageSize,
        total,
        totalPages,
        filters,
        count,
        activeCount,
        hasSectors,
        isLoading,
        hasError,
        sectorOptions,
        activeSectorOptions,
        sectorTypeOptions,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        toggleActive,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearAllErrors,
        clearAll,
        getById,
        getByCode,
        getActive,
        getInactive,
        getByType,
        getCommercial,
        getNgo,
        getPublic,
        getConsulting,
    }), [
        sectors,
        currentSector,
        loading,
        loadingDetails,
        submitting,
        error,
        toggleResult,
        pagination,
        pageNum,
        pageSize,
        total,
        totalPages,
        filters,
        count,
        activeCount,
        hasSectors,
        isLoading,
        hasError,
        sectorOptions,
        activeSectorOptions,
        sectorTypeOptions,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        toggleActive,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearAllErrors,
        clearAll,
        getById,
        getByCode,
        getActive,
        getInactive,
        getByType,
        getCommercial,
        getNgo,
        getPublic,
        getConsulting,
    ]);
};

export const useSector = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const sector = useSelector((state) => selectSectorById(state, id));
    const currentSector = useSelector(selectCurrentSector);
    const loading = useSelector(selectSectorDetailsLoading);
    const error = useSelector(selectSectorError);

    const fetchOne = useCallback((sectorId) => {
        if (!sectorId) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(fetchSector(sectorId)).unwrap();
    }, [dispatch]);

    const updateOne = useCallback((sectorId, data) => {
        if (!sectorId) return Promise.reject(new Error('Sector ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateSector({ id: sectorId, data })).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((sectorId) => {
        if (!sectorId) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(deleteSector(sectorId)).unwrap();
    }, [dispatch]);

    const toggleActiveOne = useCallback((sectorId) => {
        if (!sectorId) return Promise.reject(new Error('Sector ID is required'));
        return dispatch(toggleSectorActive(sectorId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentSector());
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch && id && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchOne(id);
        }
        return () => {
            clearCurrent();
        };
    }, [autoFetch, id, fetchOne, clearCurrent]);

    return useMemo(() => ({
        sector: sector || currentSector,
        loading,
        error,
        fetchOne,
        update: updateOne,
        remove: removeOne,
        toggleActive: toggleActiveOne,
        clearCurrent,
    }), [
        sector,
        currentSector,
        loading,
        error,
        fetchOne,
        updateOne,
        removeOne,
        toggleActiveOne,
        clearCurrent,
    ]);
};