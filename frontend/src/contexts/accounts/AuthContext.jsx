import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuth,
  selectIsLoading,
  selectAuthError,
  selectRequiresMfa,
  selectMfaToken,
  selectMfaPending,
} from '../../store/accounts';
import { logout as logoutAction, fetchCurrentUser, login as loginAction, verifyMfa as verifyMfaAction, clearMfaState } from '../../store/accounts/slice/authSlice'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getTenantId,
  setTenantId,
} from '../../services/accounts/storage/secureStorage';
import { logout as logoutApi, refreshToken as refreshTokenApi } from '../../services/accounts/api/auth';
import { persistor } from '../../store';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const error = new Error('useAuthContext must be used within AuthProvider');
    console.error('[AuthContext] Hook used outside AuthProvider', {
      message: error.message,
      stack: error.stack,
      componentStack: new Error().stack,
    });
    throw error;
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxUser = useSelector(selectUser);
  const reduxIsAuthenticated = useSelector(selectIsAuthenticated);
  const reduxIsLoading = useSelector(selectIsLoading);
  const reduxError = useSelector(selectAuthError);
  const reduxRequiresMfa = useSelector(selectRequiresMfa);
  const reduxMfaToken = useSelector(selectMfaToken);
  const reduxMfaPending = useSelector(selectMfaPending);
  const authState = useSelector(selectAuth);

  const [localError, setLocalError] = useState(null);
  const initAttempted = useRef(false);

  // ✅ Memoized derived values
  const isLoading = useMemo(() => reduxIsLoading || authState?.isLoading || false, [reduxIsLoading, authState?.isLoading]);
  const error = useMemo(() => localError || reduxError || null, [localError, reduxError]);
  const isAuthenticated = useMemo(() => reduxIsAuthenticated || false, [reduxIsAuthenticated]);
  const user = useMemo(() => reduxUser || null, [reduxUser]);

  // ✅ Initialization useEffect
  useEffect(() => {
    const initializeAuth = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;

      try {
        const token = await getAccessToken();
        if (token) {
          await dispatch(fetchCurrentUser()).unwrap();
        }
      } catch (err) {
        await clearTokens();
        await persistor.purge();
        dispatch(logoutAction());
      }
    };

    initializeAuth();

    const handleLogoutEvent = () => {
      dispatch(logoutAction());
    };
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [dispatch]);

  // ============ AUTH ACTIONS ============
  const login = useCallback(
    async (credentials) => {
      setLocalError(null);
      try {
        const result = await dispatch(loginAction(credentials)).unwrap();

        if (result.requires_mfa) {
          return { requiresMfa: true, mfaToken: result.mfa_token };
        }

        if (result.session_id) {
          sessionStorage.setItem('current_session_id', result.session_id);
        }

        if (result.user?.tenant_id) {
          await setTenantId(result.user.tenant_id);
        }

        return { success: true, user: result.user };
      } catch (err) {
        const errorMessage = typeof err === 'string' ? err : err?.message || 'Login failed';
        setLocalError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const verifyMfa = useCallback(
    async (mfaToken, otp) => {
      setLocalError(null);
      try {
        const result = await dispatch(verifyMfaAction({ mfaToken, otp })).unwrap();

        if (result.session_id) {
          sessionStorage.setItem('current_session_id', result.session_id);
        }

        if (result.user?.tenant_id) {
          await setTenantId(result.user.tenant_id);
        }

        dispatch(clearMfaState());
        return { success: true, user: result.user };
      } catch (err) {
        const errorMessage = typeof err === 'string' ? err : err?.message || 'MFA verification failed';
        setLocalError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const logout = useCallback(
    async (redirect = true) => {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          await logoutApi({ refresh: refreshToken });
        }
      } catch {
        // proceed with local logout
      } finally {
        await clearTokens();
        sessionStorage.removeItem('current_session_id');
        await persistor.purge();
        dispatch(logoutAction());
        dispatch(clearMfaState());

        if (redirect) {
          navigate('/login', { replace: true });
        }
      }
    },
    [navigate, dispatch]
  );

  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const response = await refreshTokenApi({ refresh: refreshToken });
      const { access, refresh } = response.data;

      if (access) {
        await setTokens(access, refresh || refreshToken);
        return true;
      }
      return false;
    } catch {
      await logout(false);
      return false;
    }
  }, [logout]);

  const updateUser = useCallback(
    (updatedUser) => {
      if (user) {
        const mergedUser = { ...user, ...updatedUser };
        if (mergedUser.tenant_id) {
          setTenantId(mergedUser.tenant_id);
        }
      }
    },
    [user]
  );

  // ============ ROLE CHECKS ============
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      return user.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAdmin = useCallback(() => {
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'client_admin';
  }, [user]);

  const isSuperAdmin = useCallback(() => {
    if (!user) return false;
    return user.role === 'super_admin';
  }, [user]);

  const isManagement = useCallback(() => {
    if (!user) return false;
    return ['super_admin', 'client_admin', 'executive', 'supervisor'].includes(user.role);
  }, [user]);

  const getTenant = useCallback(async () => {
    return await getTenantId();
  }, []);

  const clearError = useCallback(() => {
    setLocalError(null);
  }, []);

  // ============ CONTEXT VALUE - MOVED HERE ============
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      requiresMfa: reduxRequiresMfa,
      mfaToken: reduxMfaToken,
      mfaPending: reduxMfaPending,

      userId: user?.id || null,
      email: user?.email || null,
      role: user?.role || null,
      tenantId: user?.tenant_id || null,
      fullName: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || null,

      // Role functions
      hasRole,
      hasAnyRole,
      isAdmin,
      isSuperAdmin,
      isManagement,
      getTenant,

      // Auth actions
      login,
      verifyMfa,
      logout,
      refreshAuth,
      updateUser,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      reduxRequiresMfa,
      reduxMfaToken,
      reduxMfaPending,
      hasRole,
      hasAnyRole,
      isAdmin,
      isSuperAdmin,
      isManagement,
      getTenant,
      login,
      verifyMfa,
      logout,
      refreshAuth,
      updateUser,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};