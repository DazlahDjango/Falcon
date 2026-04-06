/**
 * Tokens - JWT token handling utilities
 */

import { jwtDecode } from 'jwt-decode';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../services/accounts/storage/secureStorage';

// ============================================================================
// Token Decoding
// ============================================================================

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const decodeAccessToken = async () => {
    const token = await getAccessToken();
    if (!token) return null;
    return decodeToken(token);
};

export const decodeRefreshToken = async () => {
    const token = await getRefreshToken();
    if (!token) return null;
    return decodeToken(token);
};

// ============================================================================
// Token Validation
// ============================================================================

export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        
        const expirationTime = decoded.exp * 1000;
        return Date.now() >= expirationTime;
    } catch (error) {
        return true;
    }
};

export const isAccessTokenExpired = async () => {
    const token = await getAccessToken();
    return isTokenExpired(token);
};

export const isRefreshTokenExpired = async () => {
    const token = await getRefreshToken();
    return isTokenExpired(token);
};

export const isValidToken = (token) => {
    return !isTokenExpired(token);
};

// ============================================================================
// Token Info
// ============================================================================

export const getTokenPayload = async () => {
    return await decodeAccessToken();
};

export const getUserIdFromToken = async () => {
    const payload = await decodeAccessToken();
    return payload?.user_id || null;
};

export const getUserRoleFromToken = async () => {
    const payload = await decodeAccessToken();
    return payload?.role || null;
};

export const getTenantIdFromToken = async () => {
    const payload = await decodeAccessToken();
    return payload?.tenant_id || null;
};

export const getTokenExpiration = async () => {
    const payload = await decodeAccessToken();
    if (!payload?.exp) return null;
    return new Date(payload.exp * 1000);
};

// ============================================================================
// Token Management
// ============================================================================

export const refreshAccessToken = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    
    try {
        const response = await fetch('/api/v1/auth/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        await setTokens(data.access, refreshToken);
        return data.access;
    } catch (error) {
        console.error('Token refresh error:', error);
        await clearTokens();
        return null;
    }
};

export const setupAutoRefresh = () => {
    const interval = setInterval(async () => {
        const payload = await decodeAccessToken();
        if (!payload?.exp) return;
        
        const expirationTime = payload.exp * 1000;
        const timeUntilExpiry = expirationTime - Date.now();
        
        // Refresh 5 minutes before expiry
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            await refreshAccessToken();
        }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
};

// ============================================================================
// Token Helpers
// ============================================================================

export const hasToken = async () => {
    const token = await getAccessToken();
    return !!token;
};

export const isAuthenticated = async () => {
    const token = await getAccessToken();
    return token && !isTokenExpired(token);
};