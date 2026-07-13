import { BaseTenantService } from './tenantBase.service';
import { RESOURCE_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class ResourceService extends BaseTenantService {
  constructor() {
    super('resources');
  }

  async getResources(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(RESOURCE_ENDPOINTS.LIST, { params })
    );
  }

  async getResource(id, params = {}) {
    if (!id) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.get(RESOURCE_ENDPOINTS.DETAIL(id), { params })
    );
  }

  async createResource(data) {
    if (!data) throw new Error('Resource data is required');
    if (!data.organization_id) throw new Error('Organization ID is required');
    if (!data.resource_type) throw new Error('Resource type is required');
    if (data.limit_value === undefined || data.limit_value === null) {
      throw new Error('Limit value is required');
    }
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.CREATE, data)
    );
  }

  async updateResource(id, data) {
    if (!id) throw new Error('Resource ID is required');
    if (!data) throw new Error('Update data is required');
    return this.withRetry(() =>
      this.apiClient.patch(RESOURCE_ENDPOINTS.UPDATE(id), data)
    );
  }

  async deleteResource(id) {
    if (!id) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(RESOURCE_ENDPOINTS.DELETE(id))
    );
  }

  async resetResource(id) {
    if (!id) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.RESET(id))
    );
  }

  async resetDailyLimits() {
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.RESET_DAILY_LIMITS)
    );
  }

  async incrementUsage(id, amount = 1) {
    if (!id) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.INCREMENT(id), { amount })
    );
  }

  async decrementUsage(id, amount = 1) {
    if (!id) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.DECREMENT(id), { amount })
    );
  }

  async takeSnapshot(id, snapshotType = 'daily', periodLabel = null) {
    if (!id) throw new Error('Resource ID is required');
    const data = { snapshot_type: snapshotType };
    if (periodLabel) data.period_label = periodLabel;
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.SNAPSHOT(id), data)
    );
  }

  async getResourceSummary(organizationId) {
    if (!organizationId) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.get(RESOURCE_ENDPOINTS.SUMMARY, { params: { organization_id: organizationId } })
    );
  }

  async getResourceAnalytics(organizationId, resourceType, days = 7) {
    if (!organizationId) throw new Error('Organization ID is required');
    if (!resourceType) throw new Error('Resource type is required');
    return this.withRetry(() =>
      this.apiClient.get(RESOURCE_ENDPOINTS.ANALYTICS, {
        params: { organization_id: organizationId, resource_type: resourceType, days }
      })
    );
  }

  async syncFromBilling(organizationId = null) {
    const data = {};
    if (organizationId) data.organization_id = organizationId;
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.SYNC_FROM_BILLING, data)
    );
  }

  async bulkIncrement(organizationId, increments) {
    if (!organizationId) throw new Error('Organization ID is required');
    if (!increments || !Array.isArray(increments)) throw new Error('Increments array is required');
    return this.withRetry(() =>
      this.apiClient.post(RESOURCE_ENDPOINTS.BULK_INCREMENT, {
        organization_id: organizationId,
        increments
      })
    );
  }

  async getExceededResources() {
    return this.withRetry(() =>
      this.apiClient.get(RESOURCE_ENDPOINTS.EXCEEDED)
    );
  }

  async getTenantResources(tenantId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.listForTenant(tenantId, params);
  }

  async getTenantResource(tenantId, resourceId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!resourceId) throw new Error('Resource ID is required');
    return this.getForTenant(tenantId, resourceId, params);
  }

  async createTenantResource(tenantId, data) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!data) throw new Error('Resource data is required');
    return this.createForTenant(tenantId, data);
  }

  async updateTenantResource(tenantId, resourceId, data) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!resourceId) throw new Error('Resource ID is required');
    if (!data) throw new Error('Update data is required');
    return this.updateForTenant(tenantId, resourceId, data);
  }

  async resetTenantResource(tenantId, resourceId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!resourceId) throw new Error('Resource ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${resourceId}/reset/`))
    );
  }

  async getResourceUsage(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.getStats({ tenant_id: tenantId });
  }
}

export const resourceService = new ResourceService();