import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthContext } from './AuthContext';
import * as permissionsApi from '../../services/accounts/api/permissions';
import * as rolesApi from '../../services/accounts/api/roles';

const PermissionContext = createContext(null);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  // ✅ Get these from useAuthContext (already includes isAdmin)
  const { user, isAuthenticated, role, isSuperAdmin, isAdmin } = useAuthContext();
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [assignableRoles, setAssignableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      if (loadedRef.current) return;
      loadedRef.current = true;

      setIsLoading(true);
      setError(null);

      try {
        const [permsResponse, rolesResponse] = await Promise.all([
          permissionsApi.getPermissions().catch(() => ({ data: [] })),
          rolesApi.getAssignableRoles().catch(() => ({ data: [] })),
        ]);

        const perms = permsResponse?.data?.results || permsResponse?.data?.data || permsResponse?.data || [];
        setPermissions(perms);

        const roles = rolesResponse?.data?.results || rolesResponse?.data?.data || rolesResponse?.data || [];
        setAssignableRoles(roles);

        if (role) {
          try {
            const rolePermsResponse = await rolesApi.getRolePermissions(role);
            const rolePerms = rolePermsResponse?.data?.permissions || rolePermsResponse?.data || [];
            setRolePermissions(rolePerms);
          } catch {
            setRolePermissions([]);
          }
        }
      } catch (err) {
        setError(err?.message || 'Failed to load permissions');
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [isAuthenticated, user, role]);

  // ============ PERMISSION CHECKS ============
  const hasPermission = useCallback(
    async (permission, obj = null) => {
      if (!user) return false;
      if (isSuperAdmin()) return true;

      if (obj) {
        try {
          const response = await permissionsApi.checkPermission(permission, obj.id);
          return response?.data?.has_permission || false;
        } catch {
          return false;
        }
      }

      if (permissions.some((p) => p.codename === permission || p === permission)) {
        return true;
      }

      if (rolePermissions.some((p) => p.codename === permission || p === permission)) {
        return true;
      }

      return false;
    },
    [user, isSuperAdmin, permissions, rolePermissions]
  );

  const hasAnyPermission = useCallback(
    async (permissionList, obj = null) => {
      for (const perm of permissionList) {
        if (await hasPermission(perm, obj)) return true;
      }
      return false;
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    async (permissionList, obj = null) => {
      for (const perm of permissionList) {
        if (!(await hasPermission(perm, obj))) return false;
      }
      return true;
    },
    [hasPermission]
  );

  // ============ ROLE CHECKS ============
  const hasRole = useCallback(
    (targetRole) => {
      if (!user) return false;
      if (Array.isArray(targetRole)) {
        return targetRole.includes(user.role);
      }
      return user.role === targetRole;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (!Array.isArray(roles)) return false;
      return roles.some(r => user.role === r);
    },
    [user]
  );

  // ✅ Use isAdmin from useAuthContext - don't redeclare
  // const isAdmin = ... // ❌ REMOVE THIS - already exists from useAuthContext

  const isManagement = useCallback(() => {
    if (!user) return false;
    return ['super_admin', 'client_admin', 'executive', 'supervisor'].includes(user.role);
  }, [user]);

  // ============ ADMIN FUNCTIONS ============
  const canAssignRole = useCallback(
    (targetRole) => {
      if (!user) return false;
      if (isSuperAdmin()) return true;

      const roleHierarchy = {
        super_admin: 5,
        client_admin: 4,
        executive: 3,
        supervisor: 2,
        staff: 1,
        read_only: 0,
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const targetLevel = roleHierarchy[targetRole] || 0;

      return userLevel > targetLevel;
    },
    [user, isSuperAdmin]
  );

  const canManageUser = useCallback(
    (targetUser) => {
      if (!user || !targetUser) return false;
      if (isSuperAdmin()) return true;
      if (isAdmin()) return user.tenant_id === targetUser.tenant_id;

      const userLevel = {
        super_admin: 5,
        client_admin: 4,
        executive: 3,
        supervisor: 2,
        staff: 1,
        read_only: 0,
      };

      const currentLevel = userLevel[user.role] || 0;
      const targetLevel = userLevel[targetUser.role] || 0;

      return currentLevel > targetLevel && user.tenant_id === targetUser.tenant_id;
    },
    [user, isSuperAdmin, isAdmin]
  );

  // ============ VALUE ============
  const value = useMemo(
    () => ({
      // State
      permissions,
      rolePermissions,
      assignableRoles,
      isLoading,
      error,

      // Permission functions
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,

      // Role functions
      hasRole,
      hasAnyRole,
      isAdmin,      // ✅ From useAuthContext
      isManagement,

      // Admin functions
      canAssignRole,
      canManageUser,
    }),
    [
      permissions,
      rolePermissions,
      assignableRoles,
      isLoading,
      error,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      isAdmin,
      isManagement,
      canAssignRole,
      canManageUser,
    ]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};