import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSchemas,
  fetchSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  provisionSchema,
  dropSchema,
  updateSchemaStats,
  fetchTenantSchemas,
  fetchSchemaStats,
  provisionTenantSchema,
  dropTenantSchema,
  clearCurrentSchema,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantSchemas,
  clearAllSchemas,
} from '../../store/tenant/slice/schema.slice';

import {
  selectSchemas,
  selectCurrentSchema,
  selectSchemaLoading,
  selectSchemaDetailsLoading,
  selectSchemaSubmitting,
  selectSchemaError,
  selectSchemaPagination,
  selectSchemaPage,
  selectSchemaTotal,
  selectSchemaTotalPages,
  selectSchemaFilters,
  selectSchemaStats,
  selectProvisioningResult,
  selectTenantSchemas,
  selectSchemaById,
  selectActiveSchemas,
  selectPendingSchemas,
  selectFailedSchemas,
  selectReadySchemas,
  selectSchemasByOrganization,
  selectSchemaCount,
  selectActiveSchemaCount,
  selectReadySchemaCount,
  selectHasSchemas,
  selectHasTenantSchemas,
} from '../../store/tenant/selectors/schema.selectors';

export const useSchemas = (options = {}) => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const schemas = useSelector(selectSchemas);
  const currentSchema = useSelector(selectCurrentSchema);
  const loading = useSelector(selectSchemaLoading);
  const loadingDetails = useSelector(selectSchemaDetailsLoading);
  const submitting = useSelector(selectSchemaSubmitting);
  const error = useSelector(selectSchemaError);
  const pagination = useSelector(selectSchemaPagination);
  const pageNum = useSelector(selectSchemaPage);
  const total = useSelector(selectSchemaTotal);
  const totalPages = useSelector(selectSchemaTotalPages);
  const filters = useSelector(selectSchemaFilters);
  const schemaStats = useSelector(selectSchemaStats);
  const provisioningResult = useSelector(selectProvisioningResult);
  const count = useSelector(selectSchemaCount);
  const activeCount = useSelector(selectActiveSchemaCount);
  const readyCount = useSelector(selectReadySchemaCount);
  const hasSchemas = useSelector(selectHasSchemas);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize,
      ...params,
    };
    return dispatch(fetchSchemas(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSize]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(fetchSchema(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Schema data is required'));
    if (!data.schema_name) return Promise.reject(new Error('Schema name is required'));
    if (!data.organization_id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(createSchema(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateSchema({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(deleteSchema(id)).unwrap();
  }, [dispatch]);

  const provision = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(provisionSchema(id)).unwrap();
  }, [dispatch]);

  const drop = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(dropSchema(id)).unwrap();
  }, [dispatch]);

  const updateStats = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(updateSchemaStats(id)).unwrap();
  }, [dispatch]);

  const fetchTenant = useCallback((tenantId, params = {}) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantSchemas({ tenantId, params })).unwrap();
  }, [dispatch]);

  const fetchStats = useCallback((tenantId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchSchemaStats(tenantId)).unwrap();
  }, [dispatch]);

  const provisionTenant = useCallback((tenantId, schemaId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(provisionTenantSchema({ tenantId, schemaId })).unwrap();
  }, [dispatch]);

  const dropTenant = useCallback((tenantId, schemaId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(dropTenantSchema({ tenantId, schemaId })).unwrap();
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

  const setPage = useCallback((page) => {
    dispatch(setPagination({ page }));
    dispatch(fetchSchemas({ page }));
  }, [dispatch]);

  const setPageSize = useCallback((pageSize) => {
    dispatch(setPagination({ pageSize, page: 1 }));
    dispatch(fetchSchemas({ pageSize, page: 1 }));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentSchema());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllSchemas());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectSchemaById(state, id));
  }, []);

  const getActive = useCallback(() => {
    return useSelector(selectActiveSchemas);
  }, []);

  const getPending = useCallback(() => {
    return useSelector(selectPendingSchemas);
  }, []);

  const getFailed = useCallback(() => {
    return useSelector(selectFailedSchemas);
  }, []);

  const getReady = useCallback(() => {
    return useSelector(selectReadySchemas);
  }, []);

  const getByOrg = useCallback((orgId) => {
    return useSelector((state) => selectSchemasByOrganization(state, orgId));
  }, []);

  const getTenantSchemas = useCallback((tenantId) => {
    return useSelector((state) => selectTenantSchemas(state, tenantId));
  }, []);

  const hasTenantSchemas = useCallback((tenantId) => {
    return useSelector((state) => selectHasTenantSchemas(state, tenantId));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  return useMemo(() => ({
    schemas,
    currentSchema,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    page: pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    schemaStats,
    provisioningResult,
    count,
    activeCount,
    readyCount,
    hasSchemas,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    provision,
    drop,
    updateStats,
    fetchTenant,
    fetchStats,
    provisionTenant,
    dropTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    setPage,
    setPageSize,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getActive,
    getPending,
    getFailed,
    getReady,
    getByOrg,
    getTenantSchemas,
    hasTenantSchemas,
  }), [
    schemas,
    currentSchema,
    loading,
    loadingDetails,
    submitting,
    error,
    pagination,
    pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    schemaStats,
    provisioningResult,
    count,
    activeCount,
    readyCount,
    hasSchemas,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    provision,
    drop,
    updateStats,
    fetchTenant,
    fetchStats,
    provisionTenant,
    dropTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getActive,
    getPending,
    getFailed,
    getReady,
    getByOrg,
    getTenantSchemas,
    hasTenantSchemas,
  ]);
};

export const useSchema = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const schema = useSelector((state) => selectSchemaById(state, id));
  const currentSchema = useSelector(selectCurrentSchema);
  const loading = useSelector(selectSchemaDetailsLoading);
  const error = useSelector(selectSchemaError);

  const fetchOne = useCallback((schemaId) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(fetchSchema(schemaId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((schemaId, data) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateSchema({ id: schemaId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((schemaId) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(deleteSchema(schemaId)).unwrap();
  }, [dispatch]);

  const provisionOne = useCallback((schemaId) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(provisionSchema(schemaId)).unwrap();
  }, [dispatch]);

  const dropOne = useCallback((schemaId) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(dropSchema(schemaId)).unwrap();
  }, [dispatch]);

  const updateStatsOne = useCallback((schemaId) => {
    if (!schemaId) return Promise.reject(new Error('Schema ID is required'));
    return dispatch(updateSchemaStats(schemaId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentSchema());
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
    schema: schema || currentSchema,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    provision: provisionOne,
    drop: dropOne,
    updateStats: updateStatsOne,
    clearCurrent,
  }), [
    schema,
    currentSchema,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    provisionOne,
    dropOne,
    updateStatsOne,
    clearCurrent,
  ]);
};