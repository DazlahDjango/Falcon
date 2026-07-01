export const selectAuth = (state) => state.auth || {};

export const selectUser = (state) => state.auth?.user || null;

export const selectIsAuthenticated = (state) => state.auth?.isAuthenticated || false;

export const selectIsInitialized = (state) => state.auth?.isInitialized || false;

export const selectIsLoading = (state) => state.auth?.isLoading || false;

export const selectAuthError = (state) => state.auth?.error || null;

export const selectRequiresMfa = (state) => state.auth?.requiresMfa || false;

export const selectMfaToken = (state) => state.auth?.mfaToken || null;

export const selectMfaPending = (state) => state.auth?.mfaPending || false;

export const selectSessionId = (state) => state.auth?.sessionId || null;

export const selectUserId = (state) => state.auth?.user?.id || null;

export const selectUserEmail = (state) => state.auth?.user?.email || null;

export const selectUserRole = (state) => state.auth?.user?.role || null;

export const selectUserTenantId = (state) => state.auth?.user?.tenant_id || null;

export const selectUserFullName = (state) => {
  const user = state.auth?.user;
  if (!user) return null;
  return user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
};

export const selectIsSuperAdmin = (state) => state.auth?.user?.is_superuser || false;

export const selectIsVerified = (state) => state.auth?.user?.is_verified || false;

export const selectAuthState = (state) => ({
  user: state.auth?.user || null,
  isAuthenticated: state.auth?.isAuthenticated || false,
  isLoading: state.auth?.isLoading || false,
  isInitialized: state.auth?.isInitialized || false,
  error: state.auth?.error || null,
  requiresMfa: state.auth?.requiresMfa || false,
  mfaPending: state.auth?.mfaPending || false,
});