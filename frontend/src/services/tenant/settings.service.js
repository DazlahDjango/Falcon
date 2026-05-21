import api from '../api';

const BASE = '/tenant/system-settings';

export const getTenantSystemSettings = () => api.get(`${BASE}/`);

export const updateTenantSystemSettings = (settings) => api.patch(`${BASE}/`, { settings });

export const resetTenantSystemSettings = () => api.post(`${BASE}/reset/`);

export const getTenantReferenceData = (tenantId, include = 'users,departments,kpis,sessions') => api.get(
    '/tenant/reference-data/',
    { params: { tenant_id: tenantId, include } },
);

export const syncTenantResources = (tenantId) => api.post(`/tenant/tenants/${tenantId}/sync-resources/`);
