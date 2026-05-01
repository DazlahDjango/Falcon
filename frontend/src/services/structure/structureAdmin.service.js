import { BaseStructureService, withRetry } from './base.service';

export class StructureAdminService extends BaseStructureService {
  constructor() {
    super('admin');
  }

  async getAdminHealth() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/health/admin/');
      return response;
    });
  }

  async getMetrics() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/health/metrics/');
      return response;
    });
  }

  async getOrphanedNodes() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/admin/orphaned-nodes/');
      return response;
    });
  }

  async repairOrphanedNodes(dryRun = true) {
    return withRetry(async () => {
      const response = await this.apiClient.post('/admin/repair-orphaned-nodes/', { dry_run: dryRun });
      return response;
    });
  }

  async clearCache() {
    return withRetry(async () => {
      const response = await this.apiClient.post('/admin/clear-cache/');
      return response;
    });
  }

  async rebuildMaterializedViews() {
    return withRetry(async () => {
      const response = await this.apiClient.post('/admin/rebuild-views/');
      return response;
    });
  }
 
  async runIntegrityCheck() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/admin/integrity-report/');
      return response;
    });
  }
  
  async fixIntegrityIssues(issueIds) {
    if (!issueIds || !issueIds.length) throw new Error('Issue IDs array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/admin/fix-issues/', { issue_ids: issueIds });
      return response;
    });
  }
  
  async exportFullBackup(format = 'json') {
    return withRetry(async () => {
      const response = await this.apiClient.get('/admin/export-backup/', {
        params: { format },
        responseType: format === 'json' ? 'json' : 'blob',
      });
      return response;
    });
  }

  async importBackup(file, dryRun = true) {
    if (!file) throw new Error('File is required');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dry_run', dryRun);
    return withRetry(async () => {
      const response = await this.apiClient.post('/admin/import-backup/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    });
  }
}
export const structureAdminService = new StructureAdminService();