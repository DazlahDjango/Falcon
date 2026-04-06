import React, { createContext, useContext, useState, useEffect, useCallback, Children } from 'react';
import { useNavigate } from 'react-router-dom';
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
                    const response = await getCurrentUser();
                    console.log('User loaded:', response.data);
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to load user:', error)
                    await clearTokens();
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);
    const login = useCallback(async (credentials) => {
        setError(null);
        try {
            const response = await loginApi(credentials);
            const { access, refresh, requires_mfa, mfa_token } = response.data;
            if (requires_mfa) {
                return { requiresMfa: true, mfaToken: mfa_token };
            }
            await setTokens(access, refresh);
            const userResponse = await getCurrentUser();
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
            return { success: false, error: error.response?.data?.error };
        }
    }, []);
    const verifyMfa = useCallback(async (mfaToken, otp) => {
        setError(null);
        try {
            const response = await loginApi.verifyMfa({ mfa_token: mfaToken, otp });
            const { access, refresh } = response.data;
            await setTokens(access, refresh);
            const userResponse = await getCurrentUser();
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.error || 'MFA verification failed');
            return { success: false, error: error.response?.data?.error };
        }
    }, []);
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