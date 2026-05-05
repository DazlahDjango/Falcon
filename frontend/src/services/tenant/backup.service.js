// frontend/src/services/tenant/backup.service.js
/**
 * Backup Management Service
 * Handles tenant data backup, restore, and download operations
 * Following CIA Triad: Confidentiality, Integrity, Availability
 * 
 * Version: 2.0.0
 */

import BaseTenantService from './tenantBase.service';
import { store } from '../../store';
import { showToast } from '../../store/tenant/slice/tenantUISlice';

class BackupService extends BaseTenantService {
    constructor() {
        super('backups');
    }

    // ==================== Backup CRUD Operations ====================

    /**
     * Get all backups with filtering
     * @param {Object} params - Filter parameters
     * @param {string} params.tenant_id - Filter by tenant
     * @param {string} params.status - Filter by status (pending, running, completed, failed)
     * @param {string} params.backup_type - Filter by type (full, incremental, config_only)
     * @param {number} params.page - Page number
     * @param {number} params.page_size - Items per page
     * @returns {Promise} { success, data, status, message }
     */
    async getBackups(params = {}) {
        return this.list(params);
    }

    /**
     * Get backups for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} params - Additional filters
     * @returns {Promise} { success, data, status, message }
     */
    async getBackupsByTenant(tenantId, params = {}) {
        return this.listForTenant(tenantId, params);
    }

    /**
     * Get single backup by ID
     * @param {string} backupId - Backup UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getBackup(backupId) {
        return this.getById(backupId);
    }

    /**
     * Create new backup
     * @param {Object} data - Backup data
     * @param {string} data.tenant_id - Tenant UUID
     * @param {string} data.backup_type - Backup type (full, incremental, config_only)
     * @param {boolean} data.include_storage - Include file storage
     * @param {boolean} data.include_audit - Include audit logs
     * @returns {Promise} { success, data, status, message }
     */
    async createBackup(data) {
        const { tenant_id, backup_type = 'full', include_storage = true, include_audit = true } = data;
        
        const backupData = {
            tenant_id,
            backup_type,
            include_storage,
            include_audit,
        };
        
        const response = await this.create(backupData, false);
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Backup started for tenant. You'll be notified when complete.`,
                type: 'info',
            }));
            
            // Start polling for backup status
            this._pollBackupStatus(response.data.id);
        }
        
        return response;
    }

    /**
     * Create backup for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} options - Backup options
     * @param {string} options.backup_type - 'full', 'incremental', 'config_only'
     * @param {boolean} options.include_storage - Include file storage
     * @param {boolean} options.include_audit - Include audit logs
     * @returns {Promise} { success, data, status, message }
     */
    async createBackupForTenant(tenantId, options = {}) {
        const {
            backup_type = 'full',
            include_storage = true,
            include_audit = true,
        } = options;

        const backupData = {
            backup_type,
            include_storage,
            include_audit,
        };

        const response = await this.createForTenant(tenantId, backupData, false);
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Backup started. You'll be notified when complete.`,
                type: 'info',
            }));
            
            // Start polling for backup status
            this._pollBackupStatus(response.data.id);
        }
        
        return response;
    }

    /**
     * Update backup metadata
     * @param {string} backupId - Backup UUID
     * @param {Object} data - Update data
     * @returns {Promise} { success, data, status, message }
     */
    async updateBackup(backupId, data) {
        return this.update(backupId, data, true);
    }

    /**
     * Delete backup
     * @param {string} backupId - Backup UUID
     * @param {boolean} permanent - Permanent deletion
     * @returns {Promise} { success, data, status, message }
     */
    async deleteBackup(backupId, permanent = false) {
        const response = await this.delete(backupId, !permanent);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Backup deleted successfully',
                type: 'info',
            }));
        }
        
        return response;
    }

    /**
     * Delete backup for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} backupId - Backup UUID
     * @returns {Promise} { success, data, status, message }
     */
    async deleteTenantBackup(tenantId, backupId) {
        const response = await this.deleteForTenant(tenantId, backupId);
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Backup deleted successfully',
                type: 'info',
            }));
        }
        
        return response;
    }

    // ==================== Backup Actions ====================

    /**
     * Restore tenant from backup
     * @param {string} backupId - Backup UUID
     * @param {Object} options - Restore options
     * @param {boolean} options.overwrite - Overwrite existing data
     * @param {Array} options.tables - Specific tables to restore
     * @returns {Promise} { success, data, status, message }
     */
    async restoreBackup(backupId, options = {}) {
        const { overwrite = false, tables = [] } = options;
        
        // Confirm with user
        const confirmed = window.confirm(
            '⚠️ WARNING: Restoring from backup will overwrite current data. This action cannot be undone. Are you absolutely sure?'
        );
        
        if (!confirmed) {
            throw new Error('Restore cancelled by user');
        }
        
        const response = await this.apiClient.post(
            this.getEndpoint(`${backupId}/restore/`),
            { overwrite, tables }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Restore started. This may take a few minutes.',
                type: 'warning',
            }));
        }
        
        return response;
    }

    /**
     * Restore backup for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} backupId - Backup UUID
     * @param {Object} options - Restore options
     * @returns {Promise} { success, data, status, message }
     */
    async restoreTenantBackup(tenantId, backupId, options = {}) {
        const confirmed = window.confirm(
            '⚠️ WARNING: Restoring will overwrite current tenant data. This action cannot be undone. Continue?'
        );
        
        if (!confirmed) {
            throw new Error('Restore cancelled by user');
        }
        
        const response = await this.apiClient.post(
            this.getTenantEndpoint(tenantId, `${backupId}/restore/`),
            options
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Restore started. The tenant may be temporarily unavailable.',
                type: 'warning',
            }));
        }
        
        return response;
    }

    /**
     * Download backup file
     * @param {string} backupId - Backup UUID
     * @param {string} filename - Custom filename (optional)
     * @returns {Promise<Blob>} Blob data for file download
     */
    async downloadBackup(backupId, filename = null) {
        const response = await this.apiClient.get(
            this.getEndpoint(`${backupId}/download/`),
            { responseType: 'blob' }
        );
        
        if (response.data) {
            // Create download link
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `backup_${backupId}.tar.gz`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            store.dispatch(showToast({
                message: 'Backup download started',
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Download backup for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {string} backupId - Backup UUID
     * @param {string} filename - Custom filename
     * @returns {Promise<Blob>} Blob data for file download
     */
    async downloadTenantBackup(tenantId, backupId, filename = null) {
        const response = await this.apiClient.get(
            this.getTenantEndpoint(tenantId, `${backupId}/download/`),
            { responseType: 'blob' }
        );
        
        if (response.data) {
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `tenant_${tenantId}_backup_${backupId}.tar.gz`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            store.dispatch(showToast({
                message: 'Backup download started',
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Get backup download URL (without downloading)
     * @param {string} backupId - Backup UUID
     * @returns {string} Download URL
     */
    getBackupDownloadUrl(backupId) {
        return this.getEndpoint(`${backupId}/download/`);
    }

    /**
     * Cancel running backup
     * @param {string} backupId - Backup UUID
     * @returns {Promise} { success, data, status, message }
     */
    async cancelBackup(backupId) {
        const response = await this.apiClient.post(
            this.getEndpoint(`${backupId}/cancel/`)
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Backup cancelled',
                type: 'warning',
            }));
        }
        
        return response;
    }

    // ==================== Backup Statistics & Monitoring ====================

    /**
     * Get backup statistics
     * @param {string} tenantId - Tenant UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getBackupStats(tenantId) {
        return this.apiClient.get(`/tenants/${tenantId}/backups/stats/`);
    }

    /**
     * Get backup size and storage usage
     * @param {string} tenantId - Tenant UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getStorageUsage(tenantId) {
        return this.apiClient.get(`/tenants/${tenantId}/backups/storage/`);
    }

    /**
     * Get global backup statistics (Super Admin only)
     * @returns {Promise} { success, data, status, message }
     */
    async getGlobalBackupStats() {
        return this.apiClient.get('/backups/global-stats/');
    }

    // ==================== Backup Schedule ====================

    /**
     * Get backup schedule for tenant
     * @param {string} tenantId - Tenant UUID
     * @returns {Promise} { success, data, status, message }
     */
    async getBackupSchedule(tenantId) {
        return this.apiClient.get(`/tenants/${tenantId}/backups/schedule/`);
    }

    /**
     * Update backup schedule for tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} schedule - Schedule configuration
     * @param {boolean} schedule.enabled - Enable/disable scheduled backups
     * @param {string} schedule.frequency - 'daily', 'weekly', 'monthly'
     * @param {string} schedule.time - Time of day (HH:MM)
     * @param {string} schedule.day_of_week - Day of week (for weekly, 0-6)
     * @param {number} schedule.day_of_month - Day of month (for monthly, 1-31)
     * @param {number} schedule.retention_days - Keep backups for N days
     * @returns {Promise} { success, data, status, message }
     */
    async updateBackupSchedule(tenantId, schedule) {
        const response = await this.apiClient.post(
            `/tenants/${tenantId}/backups/schedule/`,
            schedule
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: schedule.enabled !== false ? 
                    `Backup scheduled ${schedule.frequency} at ${schedule.time}` : 
                    'Scheduled backups disabled',
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Retention Policy ====================

    /**
     * Update backup retention policy for tenant
     * @param {string} tenantId - Tenant UUID
     * @param {number} retentionDays - Number of days to keep backups
     * @returns {Promise} { success, data, status, message }
     */
    async updateRetentionPolicy(tenantId, retentionDays) {
        const response = await this.apiClient.post(
            `/tenants/${tenantId}/backups/retention/`,
            { retention_days: retentionDays }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Retention policy updated: keeping backups for ${retentionDays} days`,
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Bulk Operations ====================

    /**
     * Bulk delete multiple backups
     * @param {Array<string>} backupIds - Array of backup IDs
     * @returns {Promise} { success, data, status, message }
     */
    async bulkDeleteBackups(backupIds) {
        const confirmed = window.confirm(`Delete ${backupIds.length} backups? This action cannot be undone.`);
        
        if (!confirmed) {
            throw new Error('Bulk delete cancelled');
        }
        
        const response = await this.bulkOperation('delete', { backup_ids: backupIds });
        
        if (response.success) {
            store.dispatch(showToast({
                message: `${backupIds.length} backups deleted`,
                type: 'success',
            }));
        }
        
        return response;
    }

    // ==================== Export ====================

    /**
     * Export backup report
     * @param {string} tenantId - Tenant UUID
     * @param {string} format - Export format (csv, json)
     * @returns {Promise<Blob>} Blob data for file download
     */
    async exportBackupReport(tenantId, format = 'csv') {
        return this.exportData(format, { tenant_id: tenantId, report_type: 'backup_history' });
    }

    // ==================== Private Helper Methods ====================

    /**
     * Poll backup status for real-time updates
     * @param {string} backupId - Backup UUID
     * @private
     */
    async _pollBackupStatus(backupId) {
        const maxAttempts = 60; // 5 minutes at 5 second intervals
        let attempts = 0;
        
        const poll = async () => {
            try {
                const response = await this.getBackup(backupId);
                
                if (response.success && response.data) {
                    const { status, completed_at, error_message, file_size_mb } = response.data;
                    
                    if (status === 'completed') {
                        store.dispatch(showToast({
                            message: `Backup completed successfully! Size: ${this._formatSize(file_size_mb)}`,
                            type: 'success',
                        }));
                        return;
                    } 
                    
                    if (status === 'failed') {
                        store.dispatch(showToast({
                            message: `Backup failed: ${error_message || 'Unknown error'}`,
                            type: 'error',
                        }));
                        return;
                    }
                    
                    if (status === 'running' || status === 'pending') {
                        if (attempts >= maxAttempts) {
                            store.dispatch(showToast({
                                message: 'Backup is taking longer than expected. Check back later.',
                                type: 'warning',
                            }));
                            return;
                        }
                        
                        attempts++;
                        setTimeout(poll, 5000); // Poll every 5 seconds
                    }
                }
            } catch (error) {
                console.error('Backup status polling failed:', error);
            }
        };
        
        // Start polling after 3 seconds
        setTimeout(poll, 3000);
    }

    /**
     * Format file size for display
     * @param {number} mb - Size in megabytes
     * @returns {string} Formatted size string
     * @private
     */
    _formatSize(mb) {
        if (!mb) return '0 MB';
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(2)} GB`;
        }
        return `${Math.round(mb)} MB`;
    }
}

// Export singleton instance
export const backupService = new BackupService();
export default backupService;