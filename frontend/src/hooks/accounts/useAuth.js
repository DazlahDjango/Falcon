import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login as loginAction,
  verifyMfa as verifyMfaAction,
  logout as logoutAction,
  fetchCurrentUser,
  clearError,
  clearMfaState,
  // ============ NEW IMPORTS ============
  register as registerAction,
  registerTenant as registerTenantAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  verifyEmail as verifyEmailAction,
  resendVerification as resendVerificationAction,
  // ============ END NEW ============
} from '../../store/accounts/slice/authSlice';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectRequiresMfa,
  selectMfaToken,
  selectMfaPending,
  selectIsInitialized,
  selectUserRole,
  selectUserTenantId,
  selectUserId,
  selectUserEmail,
  selectUserFullName,
  selectIsSuperAdmin,
  selectIsVerified,
} from '../../store/accounts/selectors/authSelectors';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const requiresMfa = useSelector(selectRequiresMfa);
  const mfaToken = useSelector(selectMfaToken);
  const mfaPending = useSelector(selectMfaPending);
  const isInitialized = useSelector(selectIsInitialized);
  const role = useSelector(selectUserRole);
  const tenantId = useSelector(selectUserTenantId);
  const userId = useSelector(selectUserId);
  const email = useSelector(selectUserEmail);
  const fullName = useSelector(selectUserFullName);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const isVerified = useSelector(selectIsVerified);

  // ============ Auth Actions ============
  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginAction(credentials)).unwrap();
      return result;
    },
    [dispatch]
  );

  const verifyMfa = useCallback(
    async (mfaToken, otp) => {
      const result = await dispatch(verifyMfaAction({ mfaToken, otp })).unwrap();
      return result;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAction()).unwrap();
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    const result = await dispatch(fetchCurrentUser()).unwrap();
    return result;
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearMfa = useCallback(() => {
    dispatch(clearMfaState());
  }, [dispatch]);

  // ============ Registration ============
  const register = useCallback(
    async (data) => {
      const result = await dispatch(registerAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const registerTenant = useCallback(
    async (data) => {
      const result = await dispatch(registerTenantAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  // ============ Password Reset ============
  const forgotPassword = useCallback(
    async (data) => {
      const result = await dispatch(forgotPasswordAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resetPassword = useCallback(
    async (data) => {
      const result = await dispatch(resetPasswordAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  // ============ Email Verification ============
  const verifyEmail = useCallback(
    async (data) => {
      const result = await dispatch(verifyEmailAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  const resendVerification = useCallback(
    async (data) => {
      const result = await dispatch(resendVerificationAction(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  // ============ Role Checks ============
  const hasRole = useCallback(
    (targetRole) => {
      if (!user) return false;
      if (Array.isArray(targetRole)) {
        return targetRole.includes(role);
      }
      return role === targetRole;
    },
    [user, role]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false;
      return roles.includes(role);
    },
    [user, role]
  );

  const isAdmin = useCallback(() => {
    return role === 'super_admin' || role === 'client_admin';
  }, [role]);

  const isManagement = useCallback(() => {
    return ['super_admin', 'client_admin', 'executive', 'supervisor'].includes(role);
  }, [role]);

  // ============ Memoized Return ============
  return useMemo(
    () => ({
      // State
      user,
      isAuthenticated,
      isLoading,
      error,
      requiresMfa,
      mfaToken,
      mfaPending,
      isInitialized,
      role,
      tenantId,
      userId,
      email,
      fullName,
      isSuperAdmin,
      isVerified,

      // Auth Actions
      login,
      verifyMfa,
      logout,
      refreshUser,
      clearAuthError,
      clearMfa,

      // Registration
      register,
      registerTenant,

      // Password Reset
      forgotPassword,
      resetPassword,

      // Email Verification
      verifyEmail,
      resendVerification,

      // Role Checks
      hasRole,
      hasAnyRole,
      isAdmin,
      isManagement,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      requiresMfa,
      mfaToken,
      mfaPending,
      isInitialized,
      role,
      tenantId,
      userId,
      email,
      fullName,
      isSuperAdmin,
      isVerified,
      login,
      verifyMfa,
      logout,
      refreshUser,
      clearAuthError,
      clearMfa,
      register,
      registerTenant,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      hasRole,
      hasAnyRole,
      isAdmin,
      isManagement,
    ]
  );
};