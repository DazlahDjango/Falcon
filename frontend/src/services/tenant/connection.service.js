import { BaseTenantService } from './tenantBase.service';
import { CONNECTION_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class ConnectionService extends BaseTenantService {
  constructor() {
    super('connections');
  }

  async getConnections(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(CONNECTION_ENDPOINTS.LIST, { params })
    );
  }

  async getConnection(id, params = {}) {
    if (!id) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.get(CONNECTION_ENDPOINTS.DETAIL(id), { params })
    );
  }

  async createConnection(data) {
    if (!data) throw new Error('Connection data is required');
    if (!data.organization_id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(CONNECTION_ENDPOINTS.CREATE, data)
    );
  }

  async updateConnection(id, data) {
    if (!id) throw new Error('Connection ID is required');
    if (!data) throw new Error('Update data is required');
    return this.withRetry(() =>
      this.apiClient.patch(CONNECTION_ENDPOINTS.UPDATE(id), data)
    );
  }

  async deleteConnection(id) {
    if (!id) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(CONNECTION_ENDPOINTS.DELETE(id))
    );
  }

  async closeConnection(id) {
    if (!id) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.post(CONNECTION_ENDPOINTS.CLOSE(id))
    );
  }

  async getConnectionStatus(id) {
    if (!id) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.get(CONNECTION_ENDPOINTS.STATUS(id))
    );
  }

  async executeAction(data) {
    if (!data) throw new Error('Action data is required');
    if (!data.action) throw new Error('Action is required');
    return this.withRetry(() =>
      this.apiClient.post(CONNECTION_ENDPOINTS.EXECUTE_ACTION, data)
    );
  }

  async getMetrics(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(CONNECTION_ENDPOINTS.METRICS, { params })
    );
  }

  async healthCheck(data = {}) {
    return this.withRetry(() =>
      this.apiClient.post(CONNECTION_ENDPOINTS.HEALTH_CHECK, data)
    );
  }

  async getDebugTraces() {
    return this.withRetry(() =>
      this.apiClient.get(CONNECTION_ENDPOINTS.DEBUG)
    );
  }

  async pauseConnection(organizationId) {
    if (!organizationId) throw new Error('Organization ID is required');
    return this.executeAction({ action: 'pause', organization_id: organizationId });
  }

  async resumeConnection(organizationId) {
    if (!organizationId) throw new Error('Organization ID is required');
    return this.executeAction({ action: 'resume', organization_id: organizationId });
  }

  async getTenantConnections(tenantId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.listForTenant(tenantId, params);
  }

  async getTenantConnection(tenantId, connectionId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!connectionId) throw new Error('Connection ID is required');
    return this.getForTenant(tenantId, connectionId, params);
  }

  async closeTenantConnection(tenantId, connectionId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!connectionId) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${connectionId}/close/`))
    );
  }

  async getTenantConnectionStatus(tenantId, connectionId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!connectionId) throw new Error('Connection ID is required');
    return this.withRetry(() =>
      this.apiClient.get(this.getTenantEndpoint(tenantId, `${connectionId}/status/`))
    );
  }
}

export const connectionService = new ConnectionService();