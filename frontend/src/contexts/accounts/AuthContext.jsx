import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction, fetchCurrentUser, login as loginAction, verifyMfa as verifyMfaAction } from '../../store/accounts/slice/authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../services/accounts/storage/secureStorage';
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from '../../services/accounts/api/auth';
import { getCurrentUser, updateProfile } from '../../services/accounts/api/users';

const AuthContext = createContext(null);
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadUser = async () => {
            const token = await getAccessToken();
            console.log('LoadUser - token exists:', !!token);
            if (token) {
                try {
                    // Sync with Redux
                    const result = await dispatch(fetchCurrentUser()).unwrap();
                    console.log('User loaded from Redux:', result);
                    setUser(result);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to load user from Redux:', error)
                    await clearTokens();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();

        const handleLogoutEvent = () => {
            console.log('[AuthContext] Logout event received');
            setIsAuthenticated(false);
            setUser(null);
            dispatch(logoutAction());
        };
        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
        };
    }, [dispatch]);
    const login = useCallback(async (credentials) => {
        setError(null);
        try {
            const result = await dispatch(loginAction(credentials)).unwrap();
            console.log('Login successful via Redux:', result);
            
            // The authSlice reducer already handles setting tokens and user
            // but we need to update our local context state too
            if (result.requires_mfa) {
                return { requiresMfa: true, mfaToken: result.mfa_token };
            }
            
            setUser(result.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            console.error('Login failed via Redux:', err);
            setError(err || 'Login failed');
            return { success: false, error: err };
        }
    }, [dispatch]);

    const verifyMfa = useCallback(async (mfaToken, otp) => {
        setError(null);
        try {
            const result = await dispatch(verifyMfaAction({ mfa_token: mfaToken, otp })).unwrap();
            console.log('MFA successful via Redux:', result);
            
            setUser(result.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            console.error('MFA failed via Redux:', err);
            setError(err || 'MFA verification failed');
            return { success: false, error: err };
        }
    }, [dispatch]);
    const logout = useCallback(async () => {
        try {
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
                await logoutApi(refreshToken);
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        }
    }, [navigate]);
    const refreshAuth = useCallback(async () => {
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) return false;
            const response = await refreshTokenApi(refreshToken);
            const { access } = response.data;
            await setTokens(access, refreshToken);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            await logout();
            return false;
        }
    }, [logout]);
    const updateUser = useCallback((updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    }, []);
    const value = {
        user, 
        isAuthenticated,
        isLoading,
        error,
        login,
        verifyMfa,
        logout,
        refreshAuth,
        updateUser
    };
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};