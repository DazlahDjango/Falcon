export const selectSecurityState = (state) => state.accountsSecurity || {};

export const selectLoginAttempts = (state) => state.accountsSecurity?.loginAttempts || [];

export const selectSelectedLoginAttempt = (state) => state.accountsSecurity?.selectedLoginAttempt || null;

export const selectTenantPolicy = (state) => state.accountsSecurity?.tenantPolicy || null;

export const selectLockoutSummary = (state) => state.accountsSecurity?.lockoutSummary || null;

export const selectSecurityLoading = (state) => state.accountsSecurity?.isLoading || false;

export const selectSecurityError = (state) => state.accountsSecurity?.error || null;

export const selectSecurityPagination = (state) => state.accountsSecurity?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectSecurityFilters = (state) => state.accountsSecurity?.filters || {};

export const selectLoginAttemptById = (state, id) => {
  const attempts = state.accountsSecurity?.loginAttempts || [];
  return attempts.find(a => a.id === id) || null;
};

export const selectFailedLoginAttempts = (state) => {
  const attempts = state.accountsSecurity?.loginAttempts || [];
  return attempts.filter(a => a.result === 'failure');
};

export const selectLockedLoginAttempts = (state) => {
  const attempts = state.accountsSecurity?.loginAttempts || [];
  return attempts.filter(a => a.result === 'locked');
};

export const selectLoginAttemptsByIp = (state, ip) => {
  const attempts = state.accountsSecurity?.loginAttempts || [];
  return attempts.filter(a => a.ip_address === ip);
};

export const selectLoginAttemptsByIdentifier = (state, identifier) => {
  const attempts = state.accountsSecurity?.loginAttempts || [];
  return attempts.filter(a => a.identifier === identifier);
};

export const selectLockoutPolicy = (state) => {
  const summary = state.accountsSecurity?.lockoutSummary;
  return summary?.lockout_policy || {};
};

export const selectFailuresLast15m = (state) => {
  const summary = state.accountsSecurity?.lockoutSummary;
  return summary?.failures_last_15m || 0;
};

export const selectLockedAttemptsLast24h = (state) => {
  const summary = state.accountsSecurity?.lockoutSummary;
  return summary?.locked_attempts_last_24h || 0;
};

export const selectTopFailureIdentifiers = (state) => {
  const summary = state.accountsSecurity?.lockoutSummary;
  return summary?.top_failure_identifiers || [];
};
export const selectSecurityBanner = (state) => state.accountsSecurity?.banner;
export const selectSecurityWsConnected = (state) => state.accountsSecurity?.wsConnected ?? false;
export const selectSecurityLastEvent = (state) => state.accountsSecurity?.lastEvent;
