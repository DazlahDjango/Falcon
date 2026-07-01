import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../../hooks/accounts/usePermissions';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { FiLock } from 'react-icons/fi';

export const PermissionGate = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  object = null,
  loadingFallback = null,
}) => {
  const { isSuperAdmin } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (isSuperAdmin()) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      if (!permission && permissions.length === 0) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      try {
        let result;
        if (permission) {
          result = await hasPermission(permission, object);
        } else if (permissions.length > 0) {
          if (requireAll) {
            result = await hasAllPermissions(permissions, object);
          } else {
            result = await hasAnyPermission(permissions, object);
          }
        } else {
          result = true;
        }
        setHasAccess(result);
      } catch {
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkPermissions();
  }, [permission, permissions, requireAll, object, isSuperAdmin, hasPermission, hasAnyPermission, hasAllPermissions]);

  if (checking) {
    return loadingFallback || <div className="permission-gate-loading">Checking permissions...</div>;
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="permission-gate-fallback">
          <FiLock className="fallback-icon" />
          <h3>Access Restricted</h3>
          <p>You don't have the required permissions to view this content.</p>
        </div>
      )
    );
  }

  return children;
};
export default PermissionGate;