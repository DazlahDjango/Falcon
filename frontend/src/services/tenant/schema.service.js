import { BaseTenantService } from './tenantBase.service';
import { SCHEMA_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class SchemaService extends BaseTenantService {
  constructor() {
    super('schemas');
  }

  async getSchemas(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(SCHEMA_ENDPOINTS.LIST, { params })
    );
  }

  async getSchema(id, params = {}) {
    if (!id) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.get(SCHEMA_ENDPOINTS.DETAIL(id), { params })
    );
  }

  async createSchema(data) {
    if (!data) throw new Error('Schema data is required');
    if (!data.schema_name) throw new Error('Schema name is required');
    if (!data.organization_id) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(SCHEMA_ENDPOINTS.CREATE, data)
    );
  }

  async updateSchema(id, data) {
    if (!id) throw new Error('Schema ID is required');
    if (!data) throw new Error('Update data is required');
    return this.withRetry(() =>
      this.apiClient.patch(SCHEMA_ENDPOINTS.UPDATE(id), data)
    );
  }

  async deleteSchema(id) {
    if (!id) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(SCHEMA_ENDPOINTS.DELETE(id))
    );
  }

  async provisionSchema(id) {
    if (!id) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.post(SCHEMA_ENDPOINTS.PROVISION(id))
    );
  }

  async dropSchema(id) {
    if (!id) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.post(SCHEMA_ENDPOINTS.DROP(id))
    );
  }

  async updateSchemaStats(id) {
    if (!id) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.post(SCHEMA_ENDPOINTS.UPDATE_STATS(id))
    );
  }

  async getTenantSchemas(tenantId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.listForTenant(tenantId, params);
  }

  async getTenantSchema(tenantId, schemaId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!schemaId) throw new Error('Schema ID is required');
    return this.getForTenant(tenantId, schemaId, params);
  }

  async createTenantSchema(tenantId, data) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!data) throw new Error('Schema data is required');
    return this.createForTenant(tenantId, data);
  }

  async provisionTenantSchema(tenantId, schemaId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!schemaId) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${schemaId}/provision/`))
    );
  }

  async dropTenantSchema(tenantId, schemaId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!schemaId) throw new Error('Schema ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${schemaId}/drop/`))
    );
  }

  async getSchemaStats(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.getStats({ tenant_id: tenantId });
  }
}

export const schemaService = new SchemaService();