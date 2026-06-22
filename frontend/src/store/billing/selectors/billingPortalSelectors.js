export const selectPortalState = (state) => state.billing?.portal || {};
export const selectPortalAccess = (state) => selectPortalState(state).portalAccess;
export const selectPortalOverview = (state) => selectPortalState(state).portalOverview;
export const selectPortalLoading = (state) => selectPortalState(state).loading;
export const selectPortalError = (state) => selectPortalState(state).error;
export const selectPortalRedirecting = (state) => selectPortalState(state).redirecting;
export const selectPortalUrl = (state) => selectPortalAccess(state)?.portal_url;
export const selectPortalSessionId = (state) => selectPortalAccess(state)?.session_id;
export const selectPortalExpiresAt = (state) => selectPortalAccess(state)?.expires_at;