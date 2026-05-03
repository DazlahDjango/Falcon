// frontend/src/services/tenant/backup.service.js
import BaseTenantService from './tenantBase.service';

class BackupService extends BaseTenantService {
    constructor() {
        super('backups');
    }

    // ==================== Backup CRUD Operations ====================

    /**
     * Get all backups (optionally filtered by tenant)
     * @param {string|number} tenantId - Optional tenant ID to filter by
     * @param {Object} params - Additional query parameters (status, backup_type)
     * @returns {Promise} { success, data, status, message }
     */
    async getBackups(tenantId = null, params = {}) {
        if (tenantId) {
            return this.listForTenant(tenantId, params);
        }
        return this.list(params);
    }

    /**
     * Get single backup by ID
     * @param {string|number} id - Backup ID
     * @returns {Promise} { success, data, status, message }
     */
    async getBackup(id) {
        return this.getById(id);
    }

    /**
     * Create new backup
     * @param {Object} data - Backup data (tenant_id, backup_type)
     * @returns {Promise} { success, data, status, message }
     */
    async createBackup(data) {
        return this.create(data);
    }

    /**
     * Create backup for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string} backupType - Backup type ('full', 'incremental', 'config_only')
     * @returns {Promise} { success, data, status, message }
     */
    async createBackupForTenant(tenantId, backupType = 'full') {
        return this.createForTenant(tenantId, { backup_type: backupType });
    }

    /**
     * Delete backup
     * @param {string|number} id - Backup ID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteBackup(id) {
        return this.delete(id);
    }

    /**
     * Delete backup for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} backupId - Backup ID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteBackupForTenant(tenantId, backupId) {
        return this.deleteForTenant(tenantId, backupId);
    }

    // ==================== Backup Actions ====================

    /**
     * Restore tenant from backup
     * @param {string|number} id - Backup ID
     * @returns {Promise} { success, data, status, message }
     */
    async restoreBackup(id) {
        return this.update(id, { action: 'restore' });
    }

    /**
     * Restore tenant from backup for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} backupId - Backup ID
     * @returns {Promise} { success, data, status, message }
     */
    async restoreBackupForTenant(tenantId, backupId) {
        return this.updateForTenant(tenantId, backupId, { action: 'restore' });
    }

    /**
     * Download backup file
     * @param {string|number} id - Backup ID
     * @returns {Promise} Blob data for file download
     */
    async downloadBackup(id) {
        const response = await this.apiClient.get(this.getEndpoint(`${id}/download/`), {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Download backup for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} backupId - Backup ID
     * @returns {Promise} Blob data for file download
     */
    async downloadBackupForTenant(tenantId, backupId) {
        const response = await this.apiClient.get(this.getTenantEndpoint(tenantId, `${backupId}/download/`), {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get backup download URL (without downloading)
     * @param {string|number} id - Backup ID
     * @returns {string} Download URL
     */
    getDownloadUrl(id) {
        return this.getEndpoint(`${id}/download/`);
    }

    /**
     * Get backup download URL for specific tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {string|number} backupId - Backup ID
     * @returns {string} Download URL
     */
    getDownloadUrlForTenant(tenantId, backupId) {
        return this.getTenantEndpoint(tenantId, `${backupId}/download/`);
    }

    // ==================== Backup Schedule ====================

    /**
     * Get backup schedule for tenant
     * @param {string|number} tenantId - Tenant ID
     * @returns {Promise} { success, data, status, message }
     */
    async getBackupSchedule(tenantId) {
        return this.listForTenant(tenantId, { type: 'schedule' });
    }

    /**
     * Update backup schedule for tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {Object} schedule - Schedule configuration (cron expression, enabled)
     * @returns {Promise} { success, data, status, message }
     */
    async updateBackupSchedule(tenantId, schedule) {
        return this.createForTenant(tenantId, { type: 'schedule', ...schedule });
    }

    // ==================== Retention Policy ====================

    /**
     * Update backup retention policy for tenant
     * @param {string|number} tenantId - Tenant ID
     * @param {number} retentionDays - Number of days to keep backups
     * @returns {Promise} { success, data, status, message }
     */
    async updateRetentionPolicy(tenantId, retentionDays) {
        return this.createForTenant(tenantId, { type: 'retention', retention_days: retentionDays });
    }
}

export default new BackupService();