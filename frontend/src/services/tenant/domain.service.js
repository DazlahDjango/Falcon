import { BaseTenantService } from './tenantBase.service';
import { DOMAIN_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class DomainService extends BaseTenantService {
  constructor() {
    super('domains');
  }

  async getDomains(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(DOMAIN_ENDPOINTS.LIST, { params })
    );
  }

  async getDomain(id, params = {}) {
    if (!id) throw new Error('Domain ID is required');
    return this.withRetry(() =>
      this.apiClient.get(DOMAIN_ENDPOINTS.DETAIL(id), { params })
    );
  }

  async createDomain(data) {
    if (!data) throw new Error('Domain data is required');
    if (!data.domain) throw new Error('Domain name is required');
    if (!data.organization_id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(DOMAIN_ENDPOINTS.CREATE, data)
    );
  }

  async updateDomain(id, data) {
    if (!id) throw new Error('Domain ID is required');
    if (!data) throw new Error('Update data is required');
    return this.withRetry(() =>
      this.apiClient.patch(DOMAIN_ENDPOINTS.UPDATE(id), data)
    );
  }

  async deleteDomain(id) {
    if (!id) throw new Error('Domain ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(DOMAIN_ENDPOINTS.DELETE(id))
    );
  }

  async verifyDomain(id) {
    if (!id) throw new Error('Domain ID is required');
    return this.withRetry(() =>
      this.apiClient.post(DOMAIN_ENDPOINTS.VERIFY(id))
    );
  }

  async setPrimaryDomain(id) {
    if (!id) throw new Error('Domain ID is required');
    return this.withRetry(() =>
      this.apiClient.post(DOMAIN_ENDPOINTS.SET_PRIMARY(id))
    );
  }

  async renewSSL(id) {
    if (!id) throw new Error('Domain ID is required');
    return this.withRetry(() =>
      this.apiClient.post(DOMAIN_ENDPOINTS.RENEW_SSL(id))
    );
  }

  async getTenantDomains(tenantId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.listForTenant(tenantId, params);
  }

  async getTenantDomain(tenantId, domainId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!domainId) throw new Error('Domain ID is required');
    return this.getForTenant(tenantId, domainId, params);
  }

  async createTenantDomain(tenantId, data) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!data) throw new Error('Domain data is required');
    return this.createForTenant(tenantId, data);
  }

  async updateTenantDomain(tenantId, domainId, data) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!domainId) throw new Error('Domain ID is required');
    if (!data) throw new Error('Update data is required');
    return this.updateForTenant(tenantId, domainId, data);
  }

  async deleteTenantDomain(tenantId, domainId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!domainId) throw new Error('Domain ID is required');
    return this.deleteForTenant(tenantId, domainId);
  }

  async verifyAllPending() {
    return this.withRetry(() =>
      this.apiClient.post(`${DOMAIN_ENDPOINTS.LIST}verify_all/`)
    );
  }

  async getExpiringSSL(days = 30) {
    return this.withRetry(() =>
      this.apiClient.get(`${DOMAIN_ENDPOINTS.LIST}expiring/`, { params: { days } })
    );
  }

  async getDomainStats(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.getStats({ tenant_id: tenantId });
  }
}

export const domainService = new DomainService();