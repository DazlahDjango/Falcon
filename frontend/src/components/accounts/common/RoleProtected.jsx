import React from 'react';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { FiLock } from 'react-icons/fi';

export const RoleProtected = ({
  children,
  roles,
  fallback = null,
  redirectTo = null,
  redirect = false,
}) => {
  const { user, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="role-protected-loading">Loading...</div>;
  }

  if (!user) {
    return fallback || null;
  }

  const hasAccess = (() => {
    if (isSuperAdmin) return true;
    if (!roles || roles.length === 0) return true;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  })();

  if (!hasAccess) {
    if (redirect && redirectTo) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    return (
      fallback || (
        <div className="role-protected-fallback">
          <FiLock className="fallback-icon" />
          <h3>Access Restricted</h3>
          <p>You don't have permission to view this content.</p>
        </div>
      )
    );
  }

  return children;
};
export default RoleProtected;