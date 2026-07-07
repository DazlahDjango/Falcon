/**
 * Shared helpers for organization API payloads and error parsing.
 */

export const SUBSCRIPTION_TIER_LABELS = {
  free: 'Free',
  basic: 'Basic',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const ORGANIZATION_STATUS_OPTIONS = [
  'PENDING',
  'PROVISIONING',
  'ACTIVE',
  'SUSPENDED',
  'ARCHIVED',
  'FAILED',
];

export const SUBSCRIPTION_TIER_OPTIONS = ['free', 'basic', 'professional', 'enterprise'];

export function getPayloadField(data, field) {
  if (data instanceof FormData) {
    const value = data.get(field);
    return value === null || value === undefined ? '' : String(value);
  }
  const value = data?.[field];
  return value === null || value === undefined ? '' : String(value);
}

export function validateOrganizationPayload(data) {
  const name = getPayloadField(data, 'name').trim();
  const email = getPayloadField(data, 'contact_email').trim();
  if (!name) {
    throw new Error('Organization name is required');
  }
  if (!email) {
    throw new Error('Contact email is required');
  }
}

/**
 * Build JSON or FormData payload from plain form state.
 * Uses JSON unless file uploads are present (backend accepts both).
 */
export function buildOrganizationPayload(formState) {
  const payload = {
    name: (formState.name || '').trim(),
    contact_email: (formState.contact_email || '').trim(),
    contact_phone: formState.contact_phone || '',
    contact_address: formState.contact_address || '',
    website: formState.website || '',
    primary_color: formState.primary_color || '#2563EB',
    secondary_color: formState.secondary_color || '#7C3AED',
    subscription_tier: formState.subscription_tier || 'free',
  };

  if (formState.sector_id) {
    payload.sector_id = formState.sector_id;
  }

  const hasLogo = formState.logo instanceof File;
  const hasFavicon = formState.favicon instanceof File;

  if (!hasLogo && !hasFavicon) {
    return payload;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });

  if (hasLogo) formData.append('logo', formState.logo);
  if (hasFavicon) formData.append('favicon', formState.favicon);

  return formData;
}

export function extractApiError(error) {
  if (typeof error === 'string') return error;

  const data = error?.response?.data ?? error?.data ?? error;

  if (typeof data === 'string') return data;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const value = data[keys[0]];
      if (Array.isArray(value)) return value[0];
      if (typeof value === 'string') return value;
    }
  }

  return error?.message || 'Request failed';
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
