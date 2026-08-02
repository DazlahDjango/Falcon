// ============================================
// frontend/src/hooks/reports/useShares.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchShares,
    fetchShare,
    createShare,
    updateShare,
    deleteShare,
    accessShare,
    deactivateShare,
    activateShare,
    fetchSharesByReport,
    fetchShareTypes,
    fetchSharePermissions,
    clearCurrentShare,
    clearShareErrors,
    setShareFilters,
    resetShareFilters,
    setSharePagination,
    clearAllShares,
    setAccessToken,
} from '../../store/reports/slice/share.slice';
import {
    selectShares,
    selectCurrentShare,
    selectSharedWithMe,
    selectShareLoading,
    selectShareDetailsLoading,
    selectShareSubmitting,
    selectShareError,
    selectSharePagination,
    selectSharePage,
    selectSharePageSize,
    selectShareTotal,
    selectShareTotalPages,
    selectShareFilters,
    selectShareById,
    selectSharesByType,
    selectSharesByPermission,
    selectActiveShares,
    selectShareCount,
    selectHasShares,
    selectIsShareLoading,
    selectHasShareError,
    selectShareTypes,
    selectSharePermissions,
    selectShareAccessToken,
} from '../../store/reports/selectors/share.selectors';

export const useShares = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchTypes = false,
        autoFetchPermissions = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchTypesCalled = useRef(false);
    const fetchPermissionsCalled = useRef(false);

    const shares = useSelector(selectShares);
    const currentShare = useSelector(selectCurrentShare);
    const sharedWithMe = useSelector(selectSharedWithMe);
    const loading = useSelector(selectShareLoading);
    const loadingDetails = useSelector(selectShareDetailsLoading);
    const submitting = useSelector(selectShareSubmitting);
    const error = useSelector(selectShareError);
    const pagination = useSelector(selectSharePagination);
    const pageNum = useSelector(selectSharePage);
    const pageSizeNum = useSelector(selectSharePageSize);
    const total = useSelector(selectShareTotal);
    const totalPages = useSelector(selectShareTotalPages);
    const filters = useSelector(selectShareFilters);
    const count = useSelector(selectShareCount);
    const hasShares = useSelector(selectHasShares);
    const isLoading = useSelector(selectIsShareLoading);
    const hasError = useSelector(selectHasShareError);
    const types = useSelector(selectShareTypes);
    const permissions = useSelector(selectSharePermissions);
    const accessToken = useSelector(selectShareAccessToken);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchShares(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Share ID is required'));
        return dispatch(fetchShare(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Share data is required'));
        return dispatch(createShare(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Share ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateShare({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Share ID is required'));
        return dispatch(deleteShare(id)).unwrap();
    }, [dispatch]);

    const access = useCallback((token, password = null) => {
        if (!token) return Promise.reject(new Error('Share token is required'));
        return dispatch(accessShare({ token, password })).unwrap();
    }, [dispatch]);

    const deactivate = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Share ID is required'));
        return dispatch(deactivateShare(id)).unwrap();
    }, [dispatch]);

    const activate = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Share ID is required'));
        return dispatch(activateShare(id)).unwrap();
    }, [dispatch]);

    const fetchByReport = useCallback((reportId) => {
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(fetchSharesByReport(reportId)).unwrap();
    }, [dispatch]);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchShareTypes()).unwrap();
    }, [dispatch]);

    const fetchPermissions = useCallback(() => {
        return dispatch(fetchSharePermissions()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setShareFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetShareFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setSharePagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentShare());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearShareErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllShares());
    }, [dispatch]);

    const setToken = useCallback((token) => {
        dispatch(setAccessToken(token));
    }, [dispatch]);

    const getById = useCallback((id) => shares.find(s => s.id === id), [shares]);
    const getByType = useCallback((type) => shares.filter(s => s.share_type === type), [shares]);
    const getByPermission = useCallback((permission) => shares.filter(s => s.permission === permission), [shares]);
    const getActive = useCallback(() => shares.filter(s => s.is_active), [shares]);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    useEffect(() => {
        if (autoFetchPermissions && !fetchPermissionsCalled.current) {
            fetchPermissionsCalled.current = true;
            fetchPermissions();
        }
    }, [autoFetchPermissions, fetchPermissions]);

    return useMemo(() => ({
        shares,
        currentShare,
        sharedWithMe,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasShares,
        isLoading,
        hasError,
        types,
        permissions,
        accessToken,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        access,
        deactivate,
        activate,
        fetchByReport,
        fetchTypes,
        fetchPermissions,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        setToken,
        getById,
        getByType,
        getByPermission,
        getActive,
    }), [
        shares,
        currentShare,
        sharedWithMe,
        loading,
        loadingDetails,
        submitting,
        error,
        pagination,
        pageNum,
        pageSizeNum,
        total,
        totalPages,
        filters,
        count,
        hasShares,
        isLoading,
        hasError,
        types,
        permissions,
        accessToken,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        access,
        deactivate,
        activate,
        fetchByReport,
        fetchTypes,
        fetchPermissions,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        setToken,
        getById,
        getByType,
        getByPermission,
        getActive,
    ]);
};

export const useShare = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const share = useSelector((state) => selectShareById(state, id));
    const currentShare = useSelector(selectCurrentShare);
    const loading = useSelector(selectShareDetailsLoading);
    const error = useSelector(selectShareError);

    const fetchOne = useCallback((shareId) => {
        if (!shareId) return Promise.reject(new Error('Share ID is required'));
        return dispatch(fetchShare(shareId)).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((shareId) => {
        if (!shareId) return Promise.reject(new Error('Share ID is required'));
        return dispatch(deleteShare(shareId)).unwrap();
    }, [dispatch]);

    const deactivateOne = useCallback((shareId) => {
        if (!shareId) return Promise.reject(new Error('Share ID is required'));
        return dispatch(deactivateShare(shareId)).unwrap();
    }, [dispatch]);

    const activateOne = useCallback((shareId) => {
        if (!shareId) return Promise.reject(new Error('Share ID is required'));
        return dispatch(activateShare(shareId)).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentShare());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearShareErrors());
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

    const resolvedShare = useMemo(() => {
        if (currentShare && currentShare.id === id) return currentShare;
        return share || currentShare;
    }, [currentShare, share, id]);

    return useMemo(() => ({
        share: resolvedShare,
        loading,
        error,
        fetchOne,
        remove: removeOne,
        deactivate: deactivateOne,
        activate: activateOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedShare,
        loading,
        error,
        fetchOne,
        removeOne,
        deactivateOne,
        activateOne,
        clearCurrent,
        clearErrors,
    ]);
};