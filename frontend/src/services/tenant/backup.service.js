// frontend/src/services/tenant/backup.service.js
import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class BackupService {
    // ========== Backup CRUD Operations ==========

    async getBackups(tenantId, params = {}) {
        const response = await api.get(API_ENDPOINTS.BACKUP.LIST, {
            params: { tenant_id: tenantId, ...params }
        });
        return response.data;
    }

    async getBackup(id) {
        const response = await api.get(API_ENDPOINTS.BACKUP.DETAIL(id));
        return response.data;
    }

    async createBackup(data) {
        const response = await api.post(API_ENDPOINTS.BACKUP.CREATE, data);
        return response.data;
    }

    async deleteBackup(id) {
        await api.delete(API_ENDPOINTS.BACKUP.DELETE(id));
    }

    async deleteMultipleBackups(backupIds) {
        const response = await api.post(API_ENDPOINTS.BACKUP.BULK_DELETE, { backupIds });
        return response.data;
    }

    // ========== Backup Restore Operations ==========

    async restoreBackup(id, options = {}) {
        const response = await api.post(API_ENDPOINTS.BACKUP.RESTORE(id), options);
        return response.data;
    }

    async getRestoreStatus(id) {
        const response = await api.get(API_ENDPOINTS.BACKUP.RESTORE_STATUS(id));
        return response.data;
    }

    // ========== Backup Download ==========

    getDownloadUrl(id) {
        return API_ENDPOINTS.BACKUP.DOWNLOAD(id);
    }

    async downloadBackup(id, filename = null) {
        const response = await api.get(API_ENDPOINTS.BACKUP.DOWNLOAD(id), {
            responseType: 'blob'
        });

        if (filename) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        return response.data;
    }

    // ========== Backup Settings ==========

    async getBackupSettings(tenantId) {
        const response = await api.get(API_ENDPOINTS.BACKUP.SETTINGS(tenantId));
        return response.data;
    }

    async updateBackupSettings(tenantId, settings) {
        const response = await api.post(API_ENDPOINTS.BACKUP.UPDATE_SETTINGS(tenantId), settings);
        return response.data;
    }

    // ========== Backup Schedule ==========

    async getBackupSchedule(tenantId) {
        const response = await api.get(API_ENDPOINTS.BACKUP.SCHEDULE(tenantId));
        return response.data;
    }

    async updateBackupSchedule(tenantId, schedule) {
        const response = await api.post(API_ENDPOINTS.BACKUP.UPDATE_SCHEDULE(tenantId), schedule);
        return response.data;
    }

    // ========== Backup Validation ==========

    async validateBackup(id) {
        const response = await api.get(API_ENDPOINTS.BACKUP.VALIDATE(id));
        return response.data;
    }

    async getBackupContents(id) {
        const response = await api.get(API_ENDPOINTS.BACKUP.CONTENTS(id));
        return response.data;
    }
}

export default new BackupService();