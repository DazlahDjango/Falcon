import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSessions,
  fetchSession,
  terminateSession,
  fetchActiveSessions,
  fetchCurrentSession,
  terminateAllSessions,
  fetchTenantActiveSessions,
  fetchBlacklistedTokens,
  blacklistToken,
  setSessionFilters,
  setSessionPage,
  clearSelectedSession,
  clearSessionError,
} from '../../store/accounts/slice/sessionSlice';
import {
  selectSessions,
  selectSelectedSession,
  selectActiveSessions,
  selectCurrentSession,
  selectTenantActiveSessions,
  selectBlacklistedTokens,
  selectSessionsLoading,
  selectSessionsTerminating,
  selectSessionsError,
  selectSessionsPagination,
  selectSessionsFilters,
  selectSessionById,
  selectActiveSessionCount,
  selectIsCurrentSession,
} from '../../store/accounts/selectors/sessionSelectors';

export const useSessions = () => {
  const dispatch = useDispatch();
  const sessions = useSelector(selectSessions);
  const selectedSession = useSelector(selectSelectedSession);
  const activeSessions = useSelector(selectActiveSessions);
  const currentSession = useSelector(selectCurrentSession);
  const tenantActiveSessions = useSelector(selectTenantActiveSessions);
  const blacklistedTokens = useSelector(selectBlacklistedTokens);
  const isLoading = useSelector(selectSessionsLoading);
  const isTerminating = useSelector(selectSessionsTerminating);
  const error = useSelector(selectSessionsError);
  const pagination = useSelector(selectSessionsPagination);
  const filters = useSelector(selectSessionsFilters);

  const getSessions = useCallback(
    async (params) => {
      const result = await dispatch(fetchSessions(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getSession = useCallback(
    async (id) => {
      const result = await dispatch(fetchSession(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const terminate = useCallback(
    async (id) => {
      const result = await dispatch(terminateSession(id)).unwrap();
      return result;
    },
    [dispatch]
  );

  const getActive = useCallback(async () => {
    const result = await dispatch(fetchActiveSessions()).unwrap();
    return result;
  }, [dispatch]);

  const getCurrent = useCallback(async () => {
    const result = await dispatch(fetchCurrentSession()).unwrap();
    return result;
  }, [dispatch]);

  const terminateAll = useCallback(async () => {
    const result = await dispatch(terminateAllSessions()).unwrap();
    return result;
  }, [dispatch]);

  const getTenantActive = useCallback(async () => {
    const result = await dispatch(fetchTenantActiveSessions()).unwrap();
    return result;
  }, [dispatch]);

  const getBlacklisted = useCallback(
    async (params) => {
      const result = await dispatch(fetchBlacklistedTokens(params)).unwrap();
      return result;
    },
    [dispatch]
  );

  const blacklist = useCallback(
    async (tokenId, reason) => {
      const result = await dispatch(blacklistToken({ tokenId, reason })).unwrap();
      return result;
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setSessionFilters(newFilters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page) => {
      dispatch(setSessionPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedSession());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSessionError());
  }, [dispatch]);

  const getSessionById = useCallback(
    (id) => {
      return selectSessionById({ sessions: { sessions } }, id);
    },
    [sessions]
  );

  const getActiveCount = useCallback(() => {
    return selectActiveSessionCount({ sessions: { activeSessions } });
  }, [activeSessions]);

  const isCurrent = useCallback(
    (sessionId) => {
      return selectIsCurrentSession({ sessions: { currentSession } }, sessionId);
    },
    [currentSession]
  );

  return useMemo(
    () => ({
      sessions,
      selectedSession,
      activeSessions,
      currentSession,
      tenantActiveSessions,
      blacklistedTokens,
      isLoading,
      isTerminating,
      error,
      pagination,
      filters,
      getSessions,
      getSession,
      terminate,
      getActive,
      getCurrent,
      terminateAll,
      getTenantActive,
      getBlacklisted,
      blacklist,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getSessionById,
      getActiveCount,
      isCurrent,
    }),
    [
      sessions,
      selectedSession,
      activeSessions,
      currentSession,
      tenantActiveSessions,
      blacklistedTokens,
      isLoading,
      isTerminating,
      error,
      pagination,
      filters,
      getSessions,
      getSession,
      terminate,
      getActive,
      getCurrent,
      terminateAll,
      getTenantActive,
      getBlacklisted,
      blacklist,
      setFilters,
      setPage,
      clearSelected,
      clearError,
      getSessionById,
      getActiveCount,
      isCurrent,
    ]
  );
};