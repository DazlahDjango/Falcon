import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/accounts/slice/authSlice';
import * as permissionsApi from '../../services/accounts/api/permissions';

export const usePermissions = () => {
    const authState = useSelector(selectAuth) || {};
    const { user } = authState;
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadPermissions = async () => {
            setIsLoading(true);
            try {
                const response = await permissionsApi.getUserPermissions();
                setPermissions(response.data.permissions || []);
            } catch (error) {
                console.error('Failed to load permissions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) {
            loadPermissions();
        }
    }, [user]);

    const hasPermission = useCallback((permission) => {
        if (user?.is_superuser || user?.role === 'super_admin') return true;
        return permissions.includes(permission);
    }, [permissions, user]);

    const hasAnyPermission = useCallback((perms) => {
        if (user?.is_superuser || user?.role === 'super_admin') return true;
        return perms.some(p => permissions.includes(p));
    }, [permissions, user]);

    const hasAllPermissions = useCallback((perms) => {
        if (user?.is_superuser || user?.role === 'super_admin') return true;
        return perms.every(p => permissions.includes(p));
    }, [permissions, user]);

    const hasRole = useCallback((role) => user?.role === role, [user]);
    
    const hasAnyRole = useCallback((roles) => roles.includes(user?.role), [user]);
    
    const isAdmin = useCallback(() => ['super_admin', 'client_admin'].includes(user?.role), [user]);
    
    const isManagement = useCallback(() => 
        ['super_admin', 'client_admin', 'executive', 'supervisor'].includes(user?.role), 
    [user]);
    
    const canManageUser = useCallback(() => 
        isAdmin() || user?.role === 'executive' || user?.role === 'supervisor', 
    [user, isAdmin]);
    
    const canViewUser = useCallback(() => true, []); // Most users can view users
    
    return {
        permissions,
        isLoading,
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