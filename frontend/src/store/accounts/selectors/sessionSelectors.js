export const selectSessionsState = (state) => state.sessions || {};

export const selectSessions = (state) => state.sessions?.sessions || [];

export const selectSelectedSession = (state) => state.sessions?.selectedSession || null;

export const selectActiveSessions = (state) => state.sessions?.activeSessions || [];

export const selectCurrentSession = (state) => state.sessions?.currentSession || null;

export const selectTenantActiveSessions = (state) => state.sessions?.tenantActiveSessions || [];

export const selectBlacklistedTokens = (state) => state.sessions?.blacklistedTokens || [];

export const selectSessionsLoading = (state) => state.sessions?.isLoading || false;

export const selectSessionsTerminating = (state) => state.sessions?.isTerminating || false;

export const selectSessionsError = (state) => state.sessions?.error || null;

export const selectSessionsPagination = (state) => state.sessions?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectSessionsFilters = (state) => state.sessions?.filters || {};

export const selectSessionById = (state, id) => {
  const sessions = state.sessions?.sessions || [];
  return sessions.find(s => s.id === id) || null;
};

export const selectActiveSessionCount = (state) => {
  const sessions = state.sessions?.activeSessions || [];
  return sessions.length;
};

export const selectIsCurrentSession = (state, sessionId) => {
  const current = state.sessions?.currentSession;
  return current?.id === sessionId;
};

export const selectSessionsByDeviceType = (state, deviceType) => {
  const sessions = state.sessions?.sessions || [];
  return sessions.filter(s => s.device_type === deviceType);
};

export const selectBlacklistedTokenCount = (state) => {
  const tokens = state.sessions?.blacklistedTokens || [];
  return tokens.length;
};