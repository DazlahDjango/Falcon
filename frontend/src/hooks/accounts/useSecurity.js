import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLoginAttempts,
  fetchLoginAttempt,
  fetchTenantPolicy,
  fetchLockoutSummary,
  setSecurityFilters,
  setSecurityPage,
  clearSelectedLoginAttempt,
  clearSecurityError,
} from '../../store/accounts/slice/securitySlice';
import {
  selectLoginAttempts,
  selectSelectedLoginAttempt,
  selectTenantPolicy,
  selectLockoutSummary,
  selectSecurityLoading,
  selectSecurityError,
  selectSecurityPagination,
  selectSecurityFilters,
  selectLoginAttemptById,
  selectFailedLoginAttempts,
  selectLockedLoginAttempts,
  selectLockoutPolicy,
  selectFailuresLast15m,
  selectLockedAttemptsLast24h,
  selectTopFailureIdentifiers,
} from '../../store/accounts/selectors/securitySelectors';

export const useSecurity = () => {
  const dispatch = useDispatch();
  const loginAttempts = useSelector(selectLoginAttempts);
  const selectedLoginAttempt = useSelector(selectSelectedLoginAttempt);
  const tenantPolicy = useSelector(selectTenantPolicy);
  const lockoutSummary = useSelector(selectLockoutSummary);
  const isLoading = useSelector(selectSecurityLoading);
  const error = useSelector(selectSecurityError);
  const pagination = useSelector(selectSecurityPagination);
  const filters = useSelector(selectSecurityFilters);

  const getLoginAttempts = useCallback(
    async (params) => {
      const result = await dispatch(fetchLoginAttempts(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getLoginAttempt = useCallback(
    async (id) => {
      const result = await dispatch(fetchLoginAttempt(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getTenantPolicy = useCallback(
    async (params) => {
      const result = await dispatch(fetchTenantPolicy(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getLockoutSummary = useCallback(async () => {
    const result = await dispatch(fetchLockoutSummary()).unwrap();
    return result;
  }, [dispatch]);

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setSecurityFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setSecurityPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedLoginAttempt());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSecurityError());
  }, [dispatch]);

  const getAttemptById = useCallback(
    (id) => {
      return selectLoginAttemptById({ accountsSecurity: { loginAttempts } }, id);
    },
    [loginAttempts]
  );

  const getFailedAttempts = useCallback(() => {
    return selectFailedLoginAttempts({ accountsSecurity: { loginAttempts } });
  }, [loginAttempts]);

  const getLockedAttempts = useCallback(() => {
    return selectLockedLoginAttempts({ accountsSecurity: { loginAttempts } });
  }, [loginAttempts]);

  const getLockoutPolicy = useCallback(() => {
    return selectLockoutPolicy({ accountsSecurity: { lockoutSummary } });
  }, [lockoutSummary]);

  const getFailuresLast15m = useCallback(() => {
    return selectFailuresLast15m({ accountsSecurity: { lockoutSummary } });
  }, [lockoutSummary]);

  const getLockedAttemptsLast24h = useCallback(() => {
    return selectLockedAttemptsLast24h({ accountsSecurity: { lockoutSummary } });
  }, [lockoutSummary]);

  const getTopFailures = useCallback(() => {
    return selectTopFailureIdentifiers({ accountsSecurity: { lockoutSummary } });
  }, [lockoutSummary]);

  return useMemo(
    () => ({
      loginAttempts,
      selectedLoginAttempt,
      tenantPolicy,
      lockoutSummary,
      isLoading,
      error,
      pagination,
      filters,
      getLoginAttempts,
      getLoginAttempt,
      getTenantPolicy,
      getLockoutSummary,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getAttemptById,
      getFailedAttempts,
      getLockedAttempts,
      getLockoutPolicy,
      getFailuresLast15m,
      getLockedAttemptsLast24h,
      getTopFailures,
    }),
    [
      loginAttempts,
      selectedLoginAttempt,
      tenantPolicy,
      lockoutSummary,
      isLoading,
      error,
      pagination,
      filters,
      getLoginAttempts,
      getLoginAttempt,
      getTenantPolicy,
      getLockoutSummary,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getAttemptById,
      getFailedAttempts,
      getLockedAttempts,
      getLockoutPolicy,
      getFailuresLast15m,
      getLockedAttemptsLast24h,
      getTopFailures,
    ]
  );
};