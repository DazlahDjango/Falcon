import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserPermissions, checkPermission as checkPermissionApi } from '../../services/accounts/api/permissions';
import { useAuthContext } from './AuthContext';

const PermissionContext = createContext(null);

export const usePermissionContext = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissionContext must be used within PermissionProvider');
    }
    return context;
};

export const PermissionProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuthContext();
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadPermissions = async () => {
            if (!isAuthenticated || !user) {
                setIsLoading(false);
                return;
            }
            try {
                // TODO: Fix permissions endpoint path
                // const response = await getUserPermissions();
                // setPermissions(response.data || []);
                setPermissions([]); // Placeholder until permissions API is fixed
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load permissions:', error);
                setIsLoading(false);
            }
        };
        loadPermissions();
    }, [isAuthenticated, user]);
    const hasPermission = useCallback(async (permission, obj = null) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (permissions.includes(permission)) return true;
        if (obj) {
            try {
                const response = await checkPermissionApi(permission, obj.id);
                return response.data.has_permission;
            } catch (error) {
                return false;
            }
        }
        return false;
    }, [user, permissions]);
    const hasAnyPermission = useCallback(async (permissionList, obj = null) => {
        for (const perm of permissionList) {
            if (await hasPermission(perm, obj)) return true;
        }
        return false;
    }, [hasPermission]);
    const hasAllPermissions = useCallback(async (permissionList, obj = null) => {
        for (const perm of permissionList) {
            if (!(await hasPermission(perm, obj))) return false;
        }
        return true;
    }, [hasPermission]);
    const hasRole = useCallback((role) => {
        if (!user) return false;
        return user.role === role;
    }, [user]);
    const hasAnyRole = useCallback((roles) => {
        if (!user) return false;
        return roles.some(role => user.role === role);
    }, [user]);
    const isAdmin = useCallback(() => {
        return hasAnyRole(['super_admin', 'client_admin']);
    }, [hasAnyRole]);
    const isManagement = useCallback(() => {
        return hasAnyRole(['super_admin', 'client_admin', 'executive', 'supervisor']);
    }, [hasAnyRole]);
    const value = {
        permissions,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        isAdmin,
        isManagement
    };
    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};