import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class BackupService extends BaseConfigService {
  constructor() {
    super('backup-jobs');
  }
  async triggerBackup(appName, backupType) {
    return this.withRetry(() => this.apiClient.post(`${CONFIG_API.TRIGGER_BACKUP}`, { app_name: appName, backup_type: backupType }));
  }
  async cancelBackup(jobId) {
    return this.withRetry(() => this.apiClient.post(`${CONFIG_API.CANCEL_BACKUP(jobId)}`));
  }
  async restoreBackup(jobId, targetAppOnly = false) {
    return this.withRetry(() => this.apiClient.post(`${CONFIG_API.RESTORE_BACKUP(jobId)}`, { target_app_only: targetAppOnly }));
  }
  async verifyBackup(jobId) {
    return this.withRetry(() => this.apiClient.post(`${CONFIG_API.VERIFY_BACKUP(jobId)}`));
  }
  async applyRetention(appId = null) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.APPLY_RETENTION, { app_id: appId }));
  }
  async getPolicies() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.BACKUP_POLICIES));
  }
  async updatePolicy(policyId, data) {
    return this.withRetry(() => this.apiClient.patch(`${CONFIG_API.BACKUP_POLICIES}/${policyId}/`, data));
  }
  async getArtifacts(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.BACKUP_ARTIFACTS, { params }));
  }
  async deleteArtifact(artifactId) {
    return this.withRetry(() => this.apiClient.delete(`${CONFIG_API.BACKUP_ARTIFACTS}/${artifactId}/delete_artifact/`));
  }
  async getBackupStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_BACKUP, { params }));
  }
}

export const backupService = new BackupService();