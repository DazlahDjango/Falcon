import { BaseTenantService } from './tenantBase.service';
import { MIGRATION_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class MigrationService extends BaseTenantService {
  constructor() {
    super('migrations');
  }

  async getMigrations(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(MIGRATION_ENDPOINTS.LIST, { params })
    );
  }

  async getMigration(id, params = {}) {
    if (!id) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.get(MIGRATION_ENDPOINTS.DETAIL(id), { params })
    );
  }

  async createMigration(data) {
    if (!data) throw new Error('Migration data is required');
    if (!data.organization_id) throw new Error('Organization ID is required');
    if (!data.migration_name) throw new Error('Migration name is required');
    if (!data.app_name) throw new Error('App name is required');
    return this.withRetry(() =>
      this.apiClient.post(MIGRATION_ENDPOINTS.CREATE, data)
    );
  }

  async updateMigration(id, data) {
    if (!id) throw new Error('Migration ID is required');
    if (!data) throw new Error('Update data is required');
    return this.withRetry(() =>
      this.apiClient.patch(MIGRATION_ENDPOINTS.UPDATE(id), data)
    );
  }

  async deleteMigration(id) {
    if (!id) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.delete(MIGRATION_ENDPOINTS.DELETE(id))
    );
  }

  async applyMigration(id) {
    if (!id) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.post(MIGRATION_ENDPOINTS.APPLY(id))
    );
  }

  async syncMigrations(organizationId) {
    if (!organizationId) throw new Error('Organization ID is required');
    return this.withRetry(() =>
      this.apiClient.post(MIGRATION_ENDPOINTS.SYNC, { organization_id: organizationId })
    );
  }

  async previewSql(id) {
    if (!id) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.get(MIGRATION_ENDPOINTS.PREVIEW_SQL(id))
    );
  }

  async rollbackMigration(id) {
    if (!id) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.post(MIGRATION_ENDPOINTS.ROLLBACK(id))
    );
  }

  async getMigrationStats(params = {}) {
    return this.withRetry(() =>
      this.apiClient.get(MIGRATION_ENDPOINTS.STATS, { params })
    );
  }

  async getTenantMigrations(tenantId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.listForTenant(tenantId, params);
  }

  async getTenantMigration(tenantId, migrationId, params = {}) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!migrationId) throw new Error('Migration ID is required');
    return this.getForTenant(tenantId, migrationId, params);
  }

  async applyTenantMigration(tenantId, migrationId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!migrationId) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${migrationId}/apply/`))
    );
  }

  async syncTenantMigrations(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, 'sync/'))
    );
  }

  async previewTenantMigrationSql(tenantId, migrationId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!migrationId) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.get(this.getTenantEndpoint(tenantId, `${migrationId}/preview-sql/`))
    );
  }

  async rollbackTenantMigration(tenantId, migrationId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    if (!migrationId) throw new Error('Migration ID is required');
    return this.withRetry(() =>
      this.apiClient.post(this.getTenantEndpoint(tenantId, `${migrationId}/rollback/`))
    );
  }

  async getTenantMigrationStats(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.getMigrationStats({ organization_id: tenantId });
  }
}

export const migrationService = new MigrationService();