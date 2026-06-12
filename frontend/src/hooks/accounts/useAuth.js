import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    login as loginAction,
    logout as logoutAction,
    register as registerAction,
    verifyMfa as verifyMfaAction,
    changePassword as changePasswordAction,
    updateProfile as updateProfileAction,
    clearError,
    selectAuth,
    fetchCurrentUser
} from '../../store/accounts/slice/authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../services/accounts/storage/secureStorage';

export const useAuth = () => {
    const dispatch = useDispatch();
    const auth = useSelector(selectAuth);

    // Provide default values if auth is undefined
    const safeAuth = auth || {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresMfa: false,
        mfaToken: null,
    };

    const login = useCallback(async (credentials) => {
        try {
            const result = await dispatch(loginAction(credentials)).unwrap();
            if (!result.requires_mfa) {
                await setTokens(result.access, result.refresh);
            }
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' };
        }
    }, [dispatch]);

    const logout = useCallback(async () => {
        try {
            await dispatch(logoutAction()).unwrap();
            await clearTokens();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Logout failed' };
        }
    }, [dispatch]);

    const register = useCallback(async (userData) => {
        try {
            const result = await dispatch(registerAction(userData)).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'Registration failed' };
        }
    }, [dispatch]);

    const verifyMfa = useCallback(async (data) => {
        try {
            const mfaToken = data.mfaToken || data.mfa_token;
            const otp = data.otp;
            const result = await dispatch(verifyMfaAction({ mfaToken, otp })).unwrap();
            await setTokens(result.access, result.refresh);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'MFA verification failed' };
        }
    }, [dispatch]);

    const changePassword = useCallback(async (passwordData) => {
        try {
            await dispatch(changePasswordAction(passwordData)).unwrap();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Password change failed' };
        }
    }, [dispatch]);

    const updateProfile = useCallback(async (profileData) => {
        try {
            const result = await dispatch(updateProfileAction(profileData)).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'Profile update failed' };
        }
    }, [dispatch]);

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const loadCurrentUser = useCallback(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return {
        user: safeAuth.user,
        isAuthenticated: safeAuth.isAuthenticated,
        isLoading: safeAuth.isLoading,
        error: safeAuth.error,
        requiresMfa: safeAuth.requiresMfa,
        mfaToken: safeAuth.mfaToken,
        // Actions
        login,
        logout,
        register,
        verifyMfa,
        changePassword,
        updateProfile,
        clearError: clearAuthError,
        loadCurrentUser
    };
};
