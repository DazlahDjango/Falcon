import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/accounts/slice/authSlice';

export const usePermissions = () => {
    const { user } = useSelector(selectAuth);
    
    const hasPermission = useCallback(() => true, []);
    const hasAnyPermission = useCallback(() => true, []);
    const hasAllPermissions = useCallback(() => true, []);
    const hasRole = useCallback((role) => user?.role === role, [user]);
    const hasAnyRole = useCallback((roles) => roles.includes(user?.role), [user]);
    const isAdmin = useCallback(() => ['super_admin', 'client_admin'].includes(user?.role), [user]);
    const isManagement = useCallback(() => ['super_admin', 'client_admin', 'executive', 'supervisor'].includes(user?.role), [user]);
    const canManageUser = useCallback(() => true, []);
    const canViewUser = useCallback(() => true, []);
    
    return {
        permissions: [],
        isLoading: false,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        isAdmin,
        isManagement,
        canManageUser,
        canViewUser
    };
};