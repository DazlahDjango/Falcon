import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
    login as loginAction, 
    logout as logoutAction,
    register as registerAction,
    verifyMfa as verifyMfaAction,
    setupMfa as setupMfaAction,
    changePassword as changePasswordAction,
    updateProfile as updateProfileAction,
    clearError,
    selectAuth
} from '../../store/accounts/slice/authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../services/accounts/storage/secureStorage';

export const useAuth = () => {
    const dispatch = useDispatch();
    const auth = useSelector(selectAuth);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const checkAuth = async () => {
            const token = await getAccessToken();
            setIsAuthenticated(!!token);
            setIsLoading(false);
        };
        checkAuth();
    }, []);
    const login = useCallback(async (credentials) => {
        try {
            const result = await dispatch(loginAction(credentials)).unwrap();
            await setTokens(result.access, result.refresh);
            setIsAuthenticated(true);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' };
        }
    }, [dispatch]);
    const logout = useCallback(async () => {
        try {
            await dispatch(logoutAction()).unwrap();
            await clearTokens();
            setIsAuthenticated(false);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Logout failed'};
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
    const verifyMfa = useCallback(async (mfaData) => {
        try {
            const result = await dispatch(verifyMfaAction(mfaData)).unwrap();
            await setTokens(result.access, result.refresh);
            setIsAuthenticated(true);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'MFA verification failed' };
        }
    }, [dispatch]);
    const setupMfa = useCallback(async () => {
        try {
            const result = await dispatch(setupMfaAction()).unwrap();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message || 'MFA setup failed' };
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
    return {
        user: auth.user,
        isAuthenticated,
        isLoading: auth.isLoading || isLoading,
        error: auth.error,
        requiresMfa: auth.requiresMfa,
        mfaToken: auth.mfaToken,
        // Actions
        login,
        logout,
        register,
        verifyMfa,
        setupMfa,
        changePassword,
        updateProfile,
        clearError: clearAuthError
    };
};