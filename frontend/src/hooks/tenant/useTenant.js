import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectCurrentOrganization,
  selectOrganizationLoading,
  selectOrganizationError,
} from '../../store/tenant/selectors/organization.selectors';

export const useTenant = () => {
  const currentOrganization = useSelector(selectCurrentOrganization);
  const loading = useSelector(selectOrganizationLoading);
  const error = useSelector(selectOrganizationError);

  const tenantId = useMemo(() => {
    return currentOrganization?.id || null;
  }, [currentOrganization]);

  const tenantSlug = useMemo(() => {
    return currentOrganization?.slug || null;
  }, [currentOrganization]);

  const tenantName = useMemo(() => {
    return currentOrganization?.name || null;
  }, [currentOrganization]);

  const tenantStatus = useMemo(() => {
    return currentOrganization?.status || null;
  }, [currentOrganization]);

  const isActive = useMemo(() => {
    return currentOrganization?.is_active === true;
  }, [currentOrganization]);

  const isOnboarded = useMemo(() => {
    return currentOrganization?.is_onboarded === true;
  }, [currentOrganization]);

  const subscriptionTier = useMemo(() => {
    return currentOrganization?.subscription_tier || null;
  }, [currentOrganization]);

  const primaryColor = useMemo(() => {
    return currentOrganization?.primary_color || '#2563EB';
  }, [currentOrganization]);

  const secondaryColor = useMemo(() => {
    return currentOrganization?.secondary_color || '#7C3AED';
  }, [currentOrganization]);

  const hasTenant = useMemo(() => {
    return currentOrganization !== null;
  }, [currentOrganization]);

  return useMemo(() => ({
    tenant: currentOrganization,
    tenantId,
    tenantSlug,
    tenantName,
    tenantStatus,
    isActive,
    isOnboarded,
    subscriptionTier,
    primaryColor,
    secondaryColor,
    hasTenant,
    loading,
    error,
  }), [
    currentOrganization,
    tenantId,
    tenantSlug,
    tenantName,
    tenantStatus,
    isActive,
    isOnboarded,
    subscriptionTier,
    primaryColor,
    secondaryColor,
    hasTenant,
    loading,
    error,
  ]);
};