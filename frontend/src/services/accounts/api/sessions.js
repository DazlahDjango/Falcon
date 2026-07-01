import { request } from './client';
import { SESSION_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getSessions = (params) => request.get(SESSION_ENDPOINTS.LIST, { params });

export const getSession = (id) => request.get(SESSION_ENDPOINTS.DETAIL(id));

export const terminateSession = (id) => request.post(SESSION_ENDPOINTS.TERMINATE(id));

export const getActiveSessions = () => request.get(SESSION_ENDPOINTS.ACTIVE_SESSIONS);

export const getCurrentSession = () => request.get(SESSION_ENDPOINTS.CURRENT_SESSION);

export const terminateAllSessions = () => request.post(SESSION_ENDPOINTS.TERMINATE_ALL);

export const getTenantActiveSessions = () => request.get(SESSION_ENDPOINTS.TENANT_ACTIVE);

export const getBlacklistedTokens = (params) => request.get(SESSION_ENDPOINTS.BLACKLIST, { params });

export const blacklistToken = (tokenId, reason = '') => request.post(SESSION_ENDPOINTS.BLACKLIST, { token_id: tokenId, reason });