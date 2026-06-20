import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../accounts/useAuth';
import { resolveDashboardRole } from '../../utils/dashboard/resolveDashboardRole';

const normalizeProfile = (raw) => {
  if (!raw) return null;

  const data = raw;

  return {
    ...data,
    id: data.id,
    email: data.email,
    firstName: data.first_name ?? data.firstName,
    lastName: data.last_name ?? data.lastName,
    fullName:
      data.full_name ||
      [data.first_name, data.last_name].filter(Boolean).join(' ') ||
      data.email,
    avatarUrl: data.avatar_url ?? data.avatar ?? data.profile_image,
    role: data.role,
    tenantId: data.tenant_id ?? data.tenantId,
    department: data.department,
    title: data.title ?? data.job_title,
    dashboardRole: resolveDashboardRole(data),
  };
};

/**
 * Live profile from accounts `/users/me/` for dashboard chrome (header + sidebars).
 */
export const useDashboardProfile = (options = {}) => {
  const { autoFetch = true } = options;
  const { user, isLoading: authLoading, isAuthenticated, loadCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated && user) {
        const normalized = normalizeProfile(user);
        setProfile(normalized);
        return normalized;
      } else if (isAuthenticated) {
        await loadCurrentUser();
        return null;
      } else {
        setProfile(null);
        return null;
      }
    } catch (err) {
      const message = err?.response?.data?.detail
        || err?.message
        || 'Failed to load profile';
      setError(new Error(message));
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, loadCurrentUser]);

  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      refresh();
    } else {
      setLoading(authLoading);
      if (!isAuthenticated) {
        setProfile(null);
      }
    }
  }, [autoFetch, refresh, isAuthenticated, authLoading]);

  useEffect(() => {
    if (user) {
      setProfile(normalizeProfile(user));
    }
  }, [user]);

  return {
    profile,
    loading: loading || authLoading,
    error,
    refresh,
    dashboardRole: profile?.dashboardRole,
  };
};

export default useDashboardProfile;
