import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMigrations,
  fetchMigration,
  createMigration,
  updateMigration,
  deleteMigration,
  applyMigration,
  fetchMigrationStats,
  fetchTenantMigrations,
  fetchTenantMigrationStats,
  applyTenantMigration,
  clearCurrentMigration,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearStats,
  clearTenantMigrations,
  clearAllMigrations,
  syncTenantMigrations,
  previewMigrationSql,
  rollbackMigration,
  clearSqlPreview,
} from '../../store/tenant/slice/migration.slice';

import {
  selectMigrations,
  selectCurrentMigration,
  selectMigrationLoading,
  selectMigrationDetailsLoading,
  selectMigrationSubmitting,
  selectMigrationError,
  selectMigrationPagination,
  selectMigrationPage,
  selectMigrationTotal,
  selectMigrationTotalPages,
  selectMigrationFilters,
  selectMigrationStats,
  selectApplyResult,
  selectTenantMigrations,
  selectMigrationById,
  selectPendingMigrations,
  selectRunningMigrations,
  selectCompletedMigrations,
  selectFailedMigrations,
  selectRolledBackMigrations,
  selectMigrationsByApp,
  selectMigrationsByOrganization,
  selectMigrationCount,
  selectPendingMigrationCount,
  selectFailedMigrationCount,
  selectCompletedMigrationCount,
  selectMigrationStatsSummary,
  selectHasMigrations,
  selectHasTenantMigrations,
  selectLastMigration,
  selectMigrationSyncing,
  selectMigrationPreviewing,
  selectMigrationRollingBack,
  selectSqlPreview,
} from '../../store/tenant/selectors/migration.selectors';

export const useMigrations = (options = {}) => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const migrations = useSelector(selectMigrations);
  const currentMigration = useSelector(selectCurrentMigration);
  const loading = useSelector(selectMigrationLoading);
  const loadingDetails = useSelector(selectMigrationDetailsLoading);
  const submitting = useSelector(selectMigrationSubmitting);
  const syncing = useSelector(selectMigrationSyncing);
  const previewing = useSelector(selectMigrationPreviewing);
  const rollingBack = useSelector(selectMigrationRollingBack);
  const sqlPreview = useSelector(selectSqlPreview);
  const error = useSelector(selectMigrationError);
  const pagination = useSelector(selectMigrationPagination);
  const pageNum = useSelector(selectMigrationPage);
  const total = useSelector(selectMigrationTotal);
  const totalPages = useSelector(selectMigrationTotalPages);
  const filters = useSelector(selectMigrationFilters);
  const stats = useSelector(selectMigrationStats);
  const applyResult = useSelector(selectApplyResult);
  const count = useSelector(selectMigrationCount);
  const pendingCount = useSelector(selectPendingMigrationCount);
  const failedCount = useSelector(selectFailedMigrationCount);
  const completedCount = useSelector(selectCompletedMigrationCount);
  const statsSummary = useSelector(selectMigrationStatsSummary);
  const hasMigrations = useSelector(selectHasMigrations);
  const lastMigration = useSelector(selectLastMigration);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize,
      ...params,
    };
    return dispatch(fetchMigrations(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSize]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(fetchMigration(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Migration data is required'));
    if (!data.organization_id) return Promise.reject(new Error('Organization ID is required'));
    if (!data.migration_name) return Promise.reject(new Error('Migration name is required'));
    if (!data.app_name) return Promise.reject(new Error('App name is required'));
    return dispatch(createMigration(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateMigration({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(deleteMigration(id)).unwrap();
  }, [dispatch]);

  const apply = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(applyMigration(id)).unwrap();
  }, [dispatch]);

  const sync = useCallback((tenantId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(syncTenantMigrations(tenantId)).unwrap();
  }, [dispatch]);

  const preview = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(previewMigrationSql(id)).unwrap();
  }, [dispatch]);

  const rollback = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(rollbackMigration(id)).unwrap();
  }, [dispatch]);

  const clearSql = useCallback(() => {
    dispatch(clearSqlPreview());
  }, [dispatch]);

  const fetchStats = useCallback((params = {}) => {
    return dispatch(fetchMigrationStats(params)).unwrap();
  }, [dispatch]);

  const fetchTenant = useCallback((tenantId, params = {}) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantMigrations({ tenantId, params })).unwrap();
  }, [dispatch]);

  const fetchTenantStats = useCallback((tenantId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantMigrationStats(tenantId)).unwrap();
  }, [dispatch]);

  const applyTenant = useCallback((tenantId, migrationId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    if (!migrationId) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(applyTenantMigration({ tenantId, migrationId })).unwrap();
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
    dispatch(clearCurrentMigration());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAllStats = useCallback(() => {
    dispatch(clearStats());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllMigrations());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectMigrationById(state, id));
  }, []);

  const getPending = useCallback(() => {
    return useSelector(selectPendingMigrations);
  }, []);

  const getRunning = useCallback(() => {
    return useSelector(selectRunningMigrations);
  }, []);

  const getCompleted = useCallback(() => {
    return useSelector(selectCompletedMigrations);
  }, []);

  const getFailed = useCallback(() => {
    return useSelector(selectFailedMigrations);
  }, []);

  const getRolledBack = useCallback(() => {
    return useSelector(selectRolledBackMigrations);
  }, []);

  const getByApp = useCallback((appName) => {
    return useSelector((state) => selectMigrationsByApp(state, appName));
  }, []);

  const getByOrg = useCallback((orgId) => {
    return useSelector((state) => selectMigrationsByOrganization(state, orgId));
  }, []);

  const getTenantMigrations = useCallback((tenantId) => {
    return useSelector((state) => selectTenantMigrations(state, tenantId));
  }, []);

  const hasTenantMigrations = useCallback((tenantId) => {
    return useSelector((state) => selectHasTenantMigrations(state, tenantId));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  return useMemo(() => ({
    migrations,
    currentMigration,
    loading,
    loadingDetails,
    submitting,
    syncing,
    previewing,
    rollingBack,
    sqlPreview,
    error,
    pagination,
    page: pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    stats,
    applyResult,
    count,
    pendingCount,
    failedCount,
    completedCount,
    statsSummary,
    hasMigrations,
    lastMigration,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    apply,
    sync,
    preview,
    rollback,
    clearSql,
    fetchStats,
    fetchTenant,
    fetchTenantStats,
    applyTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAllStats,
    clearAll,
    getById,
    getPending,
    getRunning,
    getCompleted,
    getFailed,
    getRolledBack,
    getByApp,
    getByOrg,
    getTenantMigrations,
    hasTenantMigrations,
  }), [
    migrations,
    currentMigration,
    loading,
    loadingDetails,
    submitting,
    syncing,
    previewing,
    rollingBack,
    sqlPreview,
    error,
    pagination,
    pageNum,
    pageSize,
    total,
    totalPages,
    filters,
    stats,
    applyResult,
    count,
    pendingCount,
    failedCount,
    completedCount,
    statsSummary,
    hasMigrations,
    lastMigration,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    apply,
    sync,
    preview,
    rollback,
    clearSql,
    fetchStats,
    fetchTenant,
    fetchTenantStats,
    applyTenant,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAllStats,
    clearAll,
    getById,
    getPending,
    getRunning,
    getCompleted,
    getFailed,
    getRolledBack,
    getByApp,
    getByOrg,
    getTenantMigrations,
    hasTenantMigrations,
  ]);
};

export const useMigration = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const migration = useSelector((state) => selectMigrationById(state, id));
  const currentMigration = useSelector(selectCurrentMigration);
  const loading = useSelector(selectMigrationDetailsLoading);
  const error = useSelector(selectMigrationError);

  const fetchOne = useCallback((migrationId) => {
    if (!migrationId) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(fetchMigration(migrationId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((migrationId, data) => {
    if (!migrationId) return Promise.reject(new Error('Migration ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateMigration({ id: migrationId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((migrationId) => {
    if (!migrationId) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(deleteMigration(migrationId)).unwrap();
  }, [dispatch]);

  const applyOne = useCallback((migrationId) => {
    if (!migrationId) return Promise.reject(new Error('Migration ID is required'));
    return dispatch(applyMigration(migrationId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentMigration());
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
    migration: migration || currentMigration,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    apply: applyOne,
    clearCurrent,
  }), [
    migration,
    currentMigration,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    applyOne,
    clearCurrent,
  ]);
};