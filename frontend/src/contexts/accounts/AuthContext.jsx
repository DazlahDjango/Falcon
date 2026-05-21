import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction, fetchCurrentUser, login as loginAction, verifyMfa as verifyMfaAction } from '../../store/accounts/slice/authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../services/accounts/storage/secureStorage';
import { logout as logoutApi, refreshToken as refreshTokenApi } from '../../services/accounts/api/auth';

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
            if (token) {
                try {
                    const result = await dispatch(fetchCurrentUser()).unwrap();
                    setUser(result);
                    setIsAuthenticated(true);
                } catch {
                    await clearTokens();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();

        const handleLogoutEvent = () => {
            setIsAuthenticated(false);
            setUser(null);
            sessionStorage.removeItem('current_session_id');
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
            if (result.requires_mfa) {
                return { requiresMfa: true, mfaToken: result.mfa_token };
            }
            if (result.session_id) {
                sessionStorage.setItem('current_session_id', result.session_id);
            }
            setUser(result.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            setError(err || 'Login failed');
            return { success: false, error: err };
        }
    }, [dispatch]);

    const verifyMfa = useCallback(async (mfaToken, otp) => {
        setError(null);
        try {
            const result = await dispatch(verifyMfaAction({ mfa_token: mfaToken, otp })).unwrap();
            if (result.session_id) {
                sessionStorage.setItem('current_session_id', result.session_id);
            }
            setUser(result.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
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
        } catch {
            /* proceed with local logout */
        } finally {
            await clearTokens();
            sessionStorage.removeItem('current_session_id');
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
        } catch {
            await logout();
            return false;
        }
    }, [logout]);
    const updateUser = useCallback((updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    }, []);
    const value = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        verifyMfa,
        logout,
        refreshAuth,
        updateUser,
    }), [user, isAuthenticated, isLoading, error, login, verifyMfa, logout, refreshAuth, updateUser]);
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
