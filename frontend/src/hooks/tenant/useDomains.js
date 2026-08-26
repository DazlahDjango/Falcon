import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDomains,
  fetchDomain,
  createDomain,
  updateDomain,
  deleteDomain,
  verifyDomain,
  setPrimaryDomain,
  renewSSL,
  fetchTenantDomains,
  fetchExpiringSSL,
  verifyAllPendingDomains,
  fetchDomainStats,
  clearCurrentDomain,
  clearErrors,
  setFilters,
  resetFilters,
  setPagination,
  clearTenantDomains,
  clearAllDomains,
} from '../../store/tenant/slice/domain.slice';

import {
  selectDomains,
  selectCurrentDomain,
  selectDomainLoading,
  selectDomainDetailsLoading,
  selectDomainSubmitting,
  selectDomainError,
  selectDomainPagination,
  selectDomainPage,
  selectDomainTotal,
  selectDomainTotalPages,
  selectDomainFilters,
  selectVerificationResult,
  selectSslRenewalResult,
  selectExpiringSSL,
  selectDomainStats,
  selectTenantDomains,
  selectDomainById,
  selectDomainByDomain,
  selectActiveDomains,
  selectPendingDomains,
  selectFailedDomains,
  selectPrimaryDomains,
  selectDomainsByOrganization,
  selectDomainCount,
  selectActiveDomainCount,
  selectExpiringDomainCount,
  selectHasDomains,
  selectHasTenantDomains,
} from '../../store/tenant/selectors/domain.selectors';

export const useDomains = (options = {}) => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    page = 1,
    pageSize = 20,
  } = options;

  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const domains = useSelector(selectDomains);
  const currentDomain = useSelector(selectCurrentDomain);
  const loading = useSelector(selectDomainLoading);
  const loadingDetails = useSelector(selectDomainDetailsLoading);
  const submitting = useSelector(selectDomainSubmitting);
  const error = useSelector(selectDomainError);
  const pagination = useSelector(selectDomainPagination);
  const pageNum = useSelector(selectDomainPage);
  const total = useSelector(selectDomainTotal);
  const totalPages = useSelector(selectDomainTotalPages);
  const filters = useSelector(selectDomainFilters);
  const verificationResult = useSelector(selectVerificationResult);
  const sslRenewalResult = useSelector(selectSslRenewalResult);
  const expiringSSL = useSelector(selectExpiringSSL);
  const domainStats = useSelector(selectDomainStats);
  const count = useSelector(selectDomainCount);
  const activeCount = useSelector(selectActiveDomainCount);
  const expiringCount = useSelector(selectExpiringDomainCount);
  const hasDomains = useSelector(selectHasDomains);

  const fetchList = useCallback((params = {}) => {
    const mergedParams = {
      ...filters,
      page: pageNum,
      pageSize,
      ...params,
    };
    return dispatch(fetchDomains(mergedParams)).unwrap();
  }, [dispatch, filters, pageNum, pageSize]);

  const fetchOne = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(fetchDomain(id)).unwrap();
  }, [dispatch]);

  const create = useCallback((data) => {
    if (!data) return Promise.reject(new Error('Domain data is required'));
    if (!data.domain) return Promise.reject(new Error('Domain name is required'));
    if (!data.organization_id) return Promise.reject(new Error('Organization ID is required'));
    return dispatch(createDomain(data)).unwrap();
  }, [dispatch]);

  const update = useCallback((id, data) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateDomain({ id, data })).unwrap();
  }, [dispatch]);

  const remove = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(deleteDomain(id)).unwrap();
  }, [dispatch]);

  const verify = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(verifyDomain(id)).unwrap();
  }, [dispatch]);

  const setPrimary = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(setPrimaryDomain(id)).unwrap();
  }, [dispatch]);

  const renew = useCallback((id) => {
    if (!id) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(renewSSL(id)).unwrap();
  }, [dispatch]);

  const fetchTenant = useCallback((tenantId, params = {}) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchTenantDomains({ tenantId, params })).unwrap();
  }, [dispatch]);

  const fetchExpiring = useCallback((days = 30) => {
    return dispatch(fetchExpiringSSL(days)).unwrap();
  }, [dispatch]);

  const verifyAll = useCallback(() => {
    return dispatch(verifyAllPendingDomains()).unwrap();
  }, [dispatch]);

  const fetchStats = useCallback((tenantId) => {
    if (!tenantId) return Promise.reject(new Error('Tenant ID is required'));
    return dispatch(fetchDomainStats(tenantId)).unwrap();
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
    dispatch(fetchDomains({ page }));
  }, [dispatch]);

  const setPageSize = useCallback((pageSize) => {
    dispatch(setPagination({ pageSize, page: 1 }));
    dispatch(fetchDomains({ pageSize, page: 1 }));
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentDomain());
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllDomains());
  }, [dispatch]);

  const getById = useCallback((id) => {
    return useSelector((state) => selectDomainById(state, id));
  }, []);

  const getByDomain = useCallback((domain) => {
    return useSelector((state) => selectDomainByDomain(state, domain));
  }, []);

  const getActive = useCallback(() => {
    return useSelector(selectActiveDomains);
  }, []);

  const getPending = useCallback(() => {
    return useSelector(selectPendingDomains);
  }, []);

  const getFailed = useCallback(() => {
    return useSelector(selectFailedDomains);
  }, []);

  const getPrimary = useCallback(() => {
    return useSelector(selectPrimaryDomains);
  }, []);

  const getByOrg = useCallback((orgId) => {
    return useSelector((state) => selectDomainsByOrganization(state, orgId));
  }, []);

  const getTenantDomains = useCallback((tenantId) => {
    return useSelector((state) => selectTenantDomains(state, tenantId));
  }, []);

  const hasTenantDomains = useCallback((tenantId) => {
    return useSelector((state) => selectHasTenantDomains(state, tenantId));
  }, []);

  useEffect(() => {
    if (autoFetch && !fetchCalled.current) {
      fetchCalled.current = true;
      fetchList(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchList]);

  return useMemo(() => ({
    domains,
    currentDomain,
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
    verificationResult,
    sslRenewalResult,
    expiringSSL,
    domainStats,
    count,
    activeCount,
    expiringCount,
    hasDomains,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    verify,
    setPrimary,
    renew,
    fetchTenant,
    fetchExpiring,
    verifyAll,
    fetchStats,
    updateFilters,
    resetAllFilters,
    updatePagination,
    setPage,
    setPageSize,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getByDomain,
    getActive,
    getPending,
    getFailed,
    getPrimary,
    getByOrg,
    getTenantDomains,
    hasTenantDomains,
  }), [
    domains,
    currentDomain,
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
    verificationResult,
    sslRenewalResult,
    expiringSSL,
    domainStats,
    count,
    activeCount,
    expiringCount,
    hasDomains,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    verify,
    setPrimary,
    renew,
    fetchTenant,
    fetchExpiring,
    verifyAll,
    fetchStats,
    updateFilters,
    resetAllFilters,
    updatePagination,
    clearCurrent,
    clearAllErrors,
    clearAll,
    getById,
    getByDomain,
    getActive,
    getPending,
    getFailed,
    getPrimary,
    getByOrg,
    getTenantDomains,
    hasTenantDomains,
  ]);
};

export const useDomain = (id, options = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const fetchCalled = useRef(false);

  const domain = useSelector((state) => selectDomainById(state, id));
  const currentDomain = useSelector(selectCurrentDomain);
  const loading = useSelector(selectDomainDetailsLoading);
  const error = useSelector(selectDomainError);

  const fetchOne = useCallback((domainId) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(fetchDomain(domainId)).unwrap();
  }, [dispatch]);

  const updateOne = useCallback((domainId, data) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    if (!data) return Promise.reject(new Error('Update data is required'));
    return dispatch(updateDomain({ id: domainId, data })).unwrap();
  }, [dispatch]);

  const removeOne = useCallback((domainId) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(deleteDomain(domainId)).unwrap();
  }, [dispatch]);

  const verifyOne = useCallback((domainId) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(verifyDomain(domainId)).unwrap();
  }, [dispatch]);

  const setPrimaryOne = useCallback((domainId) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(setPrimaryDomain(domainId)).unwrap();
  }, [dispatch]);

  const renewOne = useCallback((domainId) => {
    if (!domainId) return Promise.reject(new Error('Domain ID is required'));
    return dispatch(renewSSL(domainId)).unwrap();
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentDomain());
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
    domain: domain || currentDomain,
    loading,
    error,
    fetchOne,
    update: updateOne,
    remove: removeOne,
    verify: verifyOne,
    setPrimary: setPrimaryOne,
    renew: renewOne,
    clearCurrent,
  }), [
    domain,
    currentDomain,
    loading,
    error,
    fetchOne,
    updateOne,
    removeOne,
    verifyOne,
    setPrimaryOne,
    renewOne,
    clearCurrent,
  ]);
};