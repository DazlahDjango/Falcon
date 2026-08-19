/**
 * Shared API configuration for all Falcon frontend HTTP clients.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const DEFAULT_TIMEOUT_MS = 60000;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

/** Django app URL prefixes under /api/v1 */
export const API_MODULE_PATHS = {
  root: '',
  accounts: '',
  kpi: '',
  config: '/config',
  dashboard: '/dashboard',
  billing: '/billing',
  structure: '/structure',
  tenant: '/tenant',
  reviews: '/reviews',
};

export const AUTH_URL_FRAGMENTS = [
  '/auth/login',
  '/auth/register', 
  '/auth/refresh',
  '/auth/logout',
  '/auth/password-reset',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/mfa/',
  '/auth/invitation/accept',
  '/auth/invitations/accept',
];

export const PUBLIC_URL_FRAGMENTS = [
  ...AUTH_URL_FRAGMENTS,
  '/health/',
  '/docs/',
  '/public/',
  '/.well-known/',
  '/static/',
  '/media/',
];

export function isAuthUrl(url = '') {
  return AUTH_URL_FRAGMENTS.some((frag) => url.includes(frag));
}

export function isPublicUrl(url = '') {
  return PUBLIC_URL_FRAGMENTS.some((frag) => url.includes(frag));
}

export function moduleBaseUrl(modulePath = '') {
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = modulePath ? `/${modulePath.replace(/^\//, '')}` : '';
  return `${base}${path}`;
}
