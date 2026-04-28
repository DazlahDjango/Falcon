import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/accounts/api/auth'
import { useDispatch } from 'react-redux';
import { loginSuccess, logout as logoutAction } from '../store/accounts/slice/authSlice';
import { useToast } from '../hooks';

/**
 * Auth Context
 */
const AuthContext = createContext(null);

/**
 * AuthProvider - Provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedUser = authService.getUser();
                const token = authService.getAccessToken();
                
                if (storedUser && token) {
                    setUser(storedUser);
                    setIsAuthenticated(true);
                    dispatch(loginSuccess({ user: storedUser, access: token, refresh: authService.getRefreshToken() }));
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);
    const login = useCallback(async (username, password) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { user: userData, access, refresh } = await authService.login(username, password);
            setUser(userData);
            setIsAuthenticated(true);
            dispatch(loginSuccess({ user: userData, access, refresh }));
            toast.success(`Welcome back, ${userData.name || userData.email}!`);
            return userData;
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, toast]);
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await authService.register(userData);
            toast.success('Registration successful! Please check your email to verify your account.');
            return result;
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    const logout = useCallback(async () => {
        setIsLoading(true);
        
        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            dispatch(logoutAction());
            toast.info('You have been logged out.');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, toast]);
    const updateProfile = useCallback(async (profileData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const updatedUser = await authService.updateProfile(profileData);
            setUser(updatedUser);
            toast.success('Profile updated successfully');
            return updatedUser;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update profile';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    const changePassword = useCallback(async (oldPassword, newPassword) => {
        setIsLoading(true);
        setError(null);
        
        try {
            await authService.changePassword(oldPassword, newPassword);
            toast.success('Password changed successfully');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to change password';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    const requestPasswordReset = useCallback(async (email) => {
        setIsLoading(true);
        setError(null);
        
        try {
            await authService.requestPasswordReset(email);
            toast.success('Password reset email sent. Please check your inbox.');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send reset email';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    const confirmPasswordReset = useCallback(async (token, newPassword) => {
        setIsLoading(true);
        setError(null);
        
        try {
            await authService.confirmPasswordReset(token, newPassword);
            toast.success('Password reset successfully. Please login with your new password.');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to reset password';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    const hasRole = useCallback((role) => {
        return user?.roles?.includes(role) || false;
    }, [user]);
    const hasAnyRole = useCallback((roles) => {
        return roles.some(role => user?.roles?.includes(role)) || false;
    }, [user]);
    const hasAllRoles = useCallback((roles) => {
        return roles.every(role => user?.roles?.includes(role)) || false;
    }, [user]);
    const hasPermission = useCallback((permission) => {
        return user?.permissions?.includes(permission) || false;
    }, [user]);
    const hasAnyPermission = useCallback((permissions) => {
        return permissions.some(perm => user?.permissions?.includes(perm)) || false;
    }, [user]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        requestPasswordReset,
        confirmPasswordReset,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        hasPermission,
        hasAnyPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
export default AuthProvider;