import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  domains: [],
  currentDomain: null,
  tenantDomains: {},
  loading: false,
  loadingDetails: false,
  submitting: false,
  error: null,
  verificationResult: null,
  sslRenewalResult: null,
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  filters: { organization_id: null, status: null, is_primary: null, search: '' },
  expiringSSL: [],
  domainStats: null,
};

export const selectDomainState = (state) => {
    return state?.domain || state?.tenant?.domain || initialState;
};

export const selectDomains = createSelector(
  [selectDomainState],
  (state) => state.domains || []
);

export const selectCurrentDomain = createSelector(
  [selectDomainState],
  (state) => state.currentDomain || null
);

export const selectDomainLoading = createSelector(
  [selectDomainState],
  (state) => state.loading || false
);

export const selectDomainDetailsLoading = createSelector(
  [selectDomainState],
  (state) => state.loadingDetails || false
);

export const selectDomainSubmitting = createSelector(
  [selectDomainState],
  (state) => state.submitting || false
);

export const selectDomainError = createSelector(
  [selectDomainState],
  (state) => state.error || null
);

export const selectDomainPagination = createSelector(
  [selectDomainState],
  (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectDomainPage = createSelector(
  [selectDomainState],
  (state) => state.pagination?.page || 1
);

export const selectDomainTotal = createSelector(
  [selectDomainState],
  (state) => state.pagination?.total || 0
);

export const selectDomainTotalPages = createSelector(
  [selectDomainPagination],
  ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectDomainFilters = createSelector(
  [selectDomainState],
  (state) => state.filters || { organization_id: null, status: null, is_primary: null, search: '' }
);

export const selectVerificationResult = createSelector(
  [selectDomainState],
  (state) => state.verificationResult || null
);

export const selectSslRenewalResult = createSelector(
  [selectDomainState],
  (state) => state.sslRenewalResult || null
);

export const selectExpiringSSL = createSelector(
  [selectDomainState],
  (state) => state.expiringSSL || []
);

export const selectDomainStats = createSelector(
  [selectDomainState],
  (state) => state.domainStats || null
);

export const selectTenantDomains = createSelector(
  [selectDomainState, (state, tenantId) => tenantId],
  (state, tenantId) => state.tenantDomains?.[tenantId] || []
);

export const selectDomainById = createSelector(
  [selectDomains, (state, id) => id],
  (domains, id) => domains.find(d => d.id === id) || null
);

export const selectDomainByDomain = createSelector(
  [selectDomains, (state, domain) => domain],
  (domains, domain) => domains.find(d => d.domain === domain) || null
);

export const selectActiveDomains = createSelector(
  [selectDomains],
  (domains) => domains.filter(d => d.status === 'ACTIVE')
);

export const selectPendingDomains = createSelector(
  [selectDomains],
  (domains) => domains.filter(d => d.status === 'PENDING' || d.status === 'VERIFYING')
);

export const selectFailedDomains = createSelector(
  [selectDomains],
  (domains) => domains.filter(d => d.status === 'FAILED')
);

export const selectPrimaryDomains = createSelector(
  [selectDomains],
  (domains) => domains.filter(d => d.is_primary === true)
);

export const selectExpiredDomains = createSelector(
  [selectDomains],
  (domains) => domains.filter(d => d.status === 'EXPIRED')
);

export const selectDomainsByOrganization = createSelector(
  [selectDomains, (state, orgId) => orgId],
  (domains, orgId) => domains.filter(d => d.organization_id === orgId)
);

export const selectDomainCount = createSelector(
  [selectDomains],
  (domains) => domains.length
);

export const selectActiveDomainCount = createSelector(
  [selectActiveDomains],
  (active) => active.length
);

export const selectExpiringDomainCount = createSelector(
  [selectExpiringSSL],
  (expiring) => expiring.length
);

export const selectTenantDomainCount = createSelector(
  [selectTenantDomains],
  (domains) => domains.length
);

export const selectHasDomains = createSelector(
  [selectDomains],
  (domains) => domains.length > 0
);

export const selectHasTenantDomains = createSelector(
  [selectTenantDomains],
  (domains) => domains.length > 0
);