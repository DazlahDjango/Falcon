// ============================================
// frontend/src/hooks/reports/useTemplates.js
// ============================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    performTemplateAction,
    applyTemplate,
    fetchPrebuiltTemplates,
    fetchDefaultTemplates,
    fetchPopularTemplates,
    fetchTemplatesBySector,
    fetchTemplateTypes,
    clearCurrentTemplate,
    clearTemplateErrors,
    setTemplateFilters,
    resetTemplateFilters,
    setTemplatePagination,
    clearAllTemplates,
} from '../../store/reports/slice/template.slice';
import {
    selectTemplates,
    selectCurrentTemplate,
    selectPrebuiltTemplates,
    selectDefaultTemplates,
    selectPopularTemplates,
    selectTemplateLoading,
    selectTemplateDetailsLoading,
    selectTemplateSubmitting,
    selectTemplateError,
    selectTemplatePagination,
    selectTemplatePage,
    selectTemplatePageSize,
    selectTemplateTotal,
    selectTemplateTotalPages,
    selectTemplateFilters,
    selectTemplateById,
    selectTemplatesByType,
    selectTemplatesBySector,
    selectSystemTemplates,
    selectPublishedTemplates,
    selectTemplateCount,
    selectHasTemplates,
    selectIsTemplateLoading,
    selectHasTemplateError,
    selectTemplateTypes,
} from '../../store/reports/selectors/template.selectors';

export const useTemplates = (options = {}) => {
    const {
        autoFetch = true,
        autoFetchPrebuilt = false,
        autoFetchDefault = false,
        autoFetchPopular = false,
        autoFetchTypes = false,
        filters: initialFilters = {},
        page = 1,
        pageSize = 20,
    } = options;

    const dispatch = useDispatch();
    const fetchCalled = useRef(false);
    const fetchPrebuiltCalled = useRef(false);
    const fetchDefaultCalled = useRef(false);
    const fetchPopularCalled = useRef(false);
    const fetchTypesCalled = useRef(false);

    const templates = useSelector(selectTemplates);
    const currentTemplate = useSelector(selectCurrentTemplate);
    const prebuiltTemplates = useSelector(selectPrebuiltTemplates);
    const defaultTemplates = useSelector(selectDefaultTemplates);
    const popularTemplates = useSelector(selectPopularTemplates);
    const loading = useSelector(selectTemplateLoading);
    const loadingDetails = useSelector(selectTemplateDetailsLoading);
    const submitting = useSelector(selectTemplateSubmitting);
    const error = useSelector(selectTemplateError);
    const pagination = useSelector(selectTemplatePagination);
    const pageNum = useSelector(selectTemplatePage);
    const pageSizeNum = useSelector(selectTemplatePageSize);
    const total = useSelector(selectTemplateTotal);
    const totalPages = useSelector(selectTemplateTotalPages);
    const filters = useSelector(selectTemplateFilters);
    const count = useSelector(selectTemplateCount);
    const hasTemplates = useSelector(selectHasTemplates);
    const isLoading = useSelector(selectIsTemplateLoading);
    const hasError = useSelector(selectHasTemplateError);
    const types = useSelector(selectTemplateTypes);

    const fetchList = useCallback((params = {}) => {
        const mergedParams = {
            ...filters,
            page: pageNum,
            pageSize: pageSizeNum,
            ...params,
        };
        return dispatch(fetchTemplates(mergedParams)).unwrap();
    }, [dispatch, filters, pageNum, pageSizeNum]);

    const fetchOne = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Template ID is required'));
        return dispatch(fetchTemplate(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        if (!data) return Promise.reject(new Error('Template data is required'));
        return dispatch(createTemplate(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        if (!id) return Promise.reject(new Error('Template ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateTemplate({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        if (!id) return Promise.reject(new Error('Template ID is required'));
        return dispatch(deleteTemplate(id)).unwrap();
    }, [dispatch]);

    const performAction = useCallback((id, action, data = {}) => {
        if (!id) return Promise.reject(new Error('Template ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performTemplateAction({ id, action, data })).unwrap();
    }, [dispatch]);

    const apply = useCallback((id, reportId) => {
        if (!id) return Promise.reject(new Error('Template ID is required'));
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(applyTemplate({ id, reportId })).unwrap();
    }, [dispatch]);

    const fetchPrebuilt = useCallback(() => {
        return dispatch(fetchPrebuiltTemplates()).unwrap();
    }, [dispatch]);

    const fetchDefault = useCallback(() => {
        return dispatch(fetchDefaultTemplates()).unwrap();
    }, [dispatch]);

    const fetchPopular = useCallback(() => {
        return dispatch(fetchPopularTemplates()).unwrap();
    }, [dispatch]);

    const fetchBySector = useCallback((sector) => {
        if (!sector) return Promise.reject(new Error('Sector is required'));
        return dispatch(fetchTemplatesBySector(sector)).unwrap();
    }, [dispatch]);

    const fetchTypes = useCallback(() => {
        return dispatch(fetchTemplateTypes()).unwrap();
    }, [dispatch]);

    const updateFilters = useCallback((newFilters) => {
        dispatch(setTemplateFilters(newFilters));
    }, [dispatch]);

    const resetAllFilters = useCallback(() => {
        dispatch(resetTemplateFilters());
    }, [dispatch]);

    const updatePagination = useCallback((newPagination) => {
        dispatch(setTemplatePagination(newPagination));
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentTemplate());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearTemplateErrors());
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearAllTemplates());
    }, [dispatch]);

    const getById = useCallback((id) => {
        return useSelector((state) => selectTemplateById(state, id));
    }, []);

    const getByType = useCallback((type) => {
        return useSelector((state) => selectTemplatesByType(state, type));
    }, []);

    const getBySector = useCallback((sector) => {
        return useSelector((state) => selectTemplatesBySector(state, sector));
    }, []);

    const getSystem = useCallback(() => {
        return useSelector(selectSystemTemplates);
    }, []);

    const getPublished = useCallback(() => {
        return useSelector(selectPublishedTemplates);
    }, []);

    useEffect(() => {
        if (autoFetch && !fetchCalled.current) {
            fetchCalled.current = true;
            fetchList(initialFilters);
        }
    }, [autoFetch, initialFilters, fetchList]);

    useEffect(() => {
        if (autoFetchPrebuilt && !fetchPrebuiltCalled.current) {
            fetchPrebuiltCalled.current = true;
            fetchPrebuilt();
        }
    }, [autoFetchPrebuilt, fetchPrebuilt]);

    useEffect(() => {
        if (autoFetchDefault && !fetchDefaultCalled.current) {
            fetchDefaultCalled.current = true;
            fetchDefault();
        }
    }, [autoFetchDefault, fetchDefault]);

    useEffect(() => {
        if (autoFetchPopular && !fetchPopularCalled.current) {
            fetchPopularCalled.current = true;
            fetchPopular();
        }
    }, [autoFetchPopular, fetchPopular]);

    useEffect(() => {
        if (autoFetchTypes && !fetchTypesCalled.current) {
            fetchTypesCalled.current = true;
            fetchTypes();
        }
    }, [autoFetchTypes, fetchTypes]);

    return useMemo(() => ({
        templates,
        currentTemplate,
        prebuiltTemplates,
        defaultTemplates,
        popularTemplates,
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
        hasTemplates,
        isLoading,
        hasError,
        types,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        apply,
        fetchPrebuilt,
        fetchDefault,
        fetchPopular,
        fetchBySector,
        fetchTypes,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByType,
        getBySector,
        getSystem,
        getPublished,
    }), [
        templates,
        currentTemplate,
        prebuiltTemplates,
        defaultTemplates,
        popularTemplates,
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
        hasTemplates,
        isLoading,
        hasError,
        types,
        fetchList,
        fetchOne,
        create,
        update,
        remove,
        performAction,
        apply,
        fetchPrebuilt,
        fetchDefault,
        fetchPopular,
        fetchBySector,
        fetchTypes,
        updateFilters,
        resetAllFilters,
        updatePagination,
        clearCurrent,
        clearErrors,
        clearAll,
        getById,
        getByType,
        getBySector,
        getSystem,
        getPublished,
    ]);
};

export const useTemplate = (id, options = {}) => {
    const { autoFetch = true } = options;
    const dispatch = useDispatch();
    const fetchCalled = useRef(false);

    const template = useSelector((state) => selectTemplateById(state, id));
    const currentTemplate = useSelector(selectCurrentTemplate);
    const loading = useSelector(selectTemplateDetailsLoading);
    const error = useSelector(selectTemplateError);

    const fetchOne = useCallback((templateId) => {
        if (!templateId) return Promise.reject(new Error('Template ID is required'));
        return dispatch(fetchTemplate(templateId)).unwrap();
    }, [dispatch]);

    const updateOne = useCallback((templateId, data) => {
        if (!templateId) return Promise.reject(new Error('Template ID is required'));
        if (!data) return Promise.reject(new Error('Update data is required'));
        return dispatch(updateTemplate({ id: templateId, data })).unwrap();
    }, [dispatch]);

    const removeOne = useCallback((templateId) => {
        if (!templateId) return Promise.reject(new Error('Template ID is required'));
        return dispatch(deleteTemplate(templateId)).unwrap();
    }, [dispatch]);

    const performActionOne = useCallback((templateId, action, data = {}) => {
        if (!templateId) return Promise.reject(new Error('Template ID is required'));
        if (!action) return Promise.reject(new Error('Action is required'));
        return dispatch(performTemplateAction({ id: templateId, action, data })).unwrap();
    }, [dispatch]);

    const applyOne = useCallback((templateId, reportId) => {
        if (!templateId) return Promise.reject(new Error('Template ID is required'));
        if (!reportId) return Promise.reject(new Error('Report ID is required'));
        return dispatch(applyTemplate({ id: templateId, reportId })).unwrap();
    }, [dispatch]);

    const clearCurrent = useCallback(() => {
        dispatch(clearCurrentTemplate());
    }, [dispatch]);

    const clearErrors = useCallback(() => {
        dispatch(clearTemplateErrors());
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

    const resolvedTemplate = useMemo(() => {
        if (currentTemplate && currentTemplate.id === id) return currentTemplate;
        return template || currentTemplate;
    }, [currentTemplate, template, id]);

    return useMemo(() => ({
        template: resolvedTemplate,
        loading,
        error,
        fetchOne,
        update: updateOne,
        remove: removeOne,
        performAction: performActionOne,
        apply: applyOne,
        clearCurrent,
        clearErrors,
    }), [
        resolvedTemplate,
        loading,
        error,
        fetchOne,
        updateOne,
        removeOne,
        performActionOne,
        applyOne,
        clearCurrent,
        clearErrors,
    ]);
};