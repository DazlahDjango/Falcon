import { request } from './client';

// Session Management
// =====================
export const getSessions = (params = {}) => {
    return request.get('/sessions/', { params });
};
export const getActiveSessions = () => {
    return request.get('/sessions/active/');
};
export const getCurrentSession = () => {
    return request.get('/sessions/current/');
};
export const terminateSession = (sessionId) => {
    return request.post(`/sessions/${sessionId}/terminate/`);
};
export const terminateAllSessions = () => {
    return request.post('/sessions/terminate-all/');
};

// Session Blacklist (Admin)
// ===========================
export const getBlacklistedTokens = (params = {}) => {
    return request.get('/sessions/blacklist/', { params });
};
export const blacklistToken = (tokenId, reason = '') => {
    return request.post('/sessions/blacklist/', { token_id: tokenId, reason });
};