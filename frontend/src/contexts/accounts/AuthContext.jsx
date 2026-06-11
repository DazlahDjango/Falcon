import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction, fetchCurrentUser, login as loginAction, verifyMfa as verifyMfaAction, selectUser, selectIsAuthenticated, selectAuth } from '../../store/accounts/slice/authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, getTenantId } from '../../services/accounts/storage/secureStorage';
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
    
    // Use Redux selectors for single source of truth
    const reduxUser = useSelector(selectUser);
    const reduxIsAuthenticated = useSelector(selectIsAuthenticated);
    const authState = useSelector(selectAuth);
    
    const [localUser, setLocalUser] = useState(null);
    const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Sync with Redux state
    useEffect(() => {
        if (reduxUser !== localUser) {
            setLocalUser(reduxUser);
        }
        if (reduxIsAuthenticated !== localIsAuthenticated) {
            setLocalIsAuthenticated(reduxIsAuthenticated);
        }
    }, [reduxUser, reduxIsAuthenticated, localUser, localIsAuthenticated]);
    
    useEffect(() => {
        const loadUser = async () => {
            const token = await getAccessToken();
            if (token && !reduxUser) {
                try {
                    await dispatch(fetchCurrentUser()).unwrap();
                } catch {
                    await clearTokens();
                }
            }
            setIsLoading(false);
        };
        loadUser();

        const handleLogoutEvent = () => {
            setLocalIsAuthenticated(false);
            setLocalUser(null);
            sessionStorage.removeItem('current_session_id');
            dispatch(logoutAction());
        };
        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
        };
    }, [dispatch, reduxUser]);
    
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
            // Redux will update, which will sync to local state via useEffect
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
            // proceed with local logout
        } finally {
            await clearTokens();
            sessionStorage.removeItem('current_session_id');
            dispatch(logoutAction());
            navigate('/login', { replace: true });
        }
    }, [navigate, dispatch]);
    
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
        setLocalUser(prev => ({ ...prev, ...updatedUser }));
    }, []);
    
    // ✅ Helper methods for permissions (used by billing, kpi, etc.)
    const hasRole = useCallback((role) => {
        const userRole = localUser?.role || reduxUser?.role;
        if (Array.isArray(role)) {
            return role.includes(userRole);
        }
        return userRole === role;
    }, [localUser, reduxUser]);
    
    const hasAnyRole = useCallback((roles) => {
        const userRole = localUser?.role || reduxUser?.role;
        return roles.includes(userRole);
    }, [localUser, reduxUser]);
    
    const isAdmin = useCallback(() => {
        const userRole = localUser?.role || reduxUser?.role;
        return userRole === 'super_admin' || userRole === 'client_admin';
    }, [localUser, reduxUser]);
    
    const isSuperAdmin = useCallback(() => {
        const userRole = localUser?.role || reduxUser?.role;
        return userRole === 'super_admin';
    }, [localUser, reduxUser]);
    
    const getTenant = useCallback(async () => {
        return await getTenantId();
    }, []);
    
    const value = useMemo(() => ({
        // User info
        user: localUser || reduxUser,
        isAuthenticated: localIsAuthenticated || reduxIsAuthenticated,
        isLoading,
        error,
        
        // User details
        userId: localUser?.id || reduxUser?.id,
        email: localUser?.email || reduxUser?.email,
        role: localUser?.role || reduxUser?.role,
        tenantId: localUser?.tenant_id || reduxUser?.tenant_id,
        
        // Permissions methods (for billing, kpi, etc.)
        hasRole,
        hasAnyRole,
        isAdmin,
        isSuperAdmin,
        getTenant,
        
        // Auth actions
        login,
        verifyMfa,
        logout,
        refreshAuth,
        updateUser,
    }), [
        localUser, reduxUser,
        localIsAuthenticated, reduxIsAuthenticated,
        isLoading, error,
        hasRole, hasAnyRole, isAdmin, isSuperAdmin, getTenant,
        login, verifyMfa, logout, refreshAuth, updateUser
    ]);
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};