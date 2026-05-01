import { BaseStructureService, withRetry } from './base.service';

export class HierarchyService extends BaseStructureService {
  constructor() {
    super('hierarchy');
  }

  async captureSnapshot(data = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.post('/hierarchy/capture/', data);
      return response;
    });
  }

  async getCurrentVersion() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/hierarchy/current/');
      return response;
    });
  }

  async getVersionHistory(limit = 20) {
    return withRetry(async () => {
      const response = await this.apiClient.get('/hierarchy/history/', { params: { limit } });
      return response;
    });
  }

  async getVersion(versionId) {
    if (!versionId) throw new Error('Version ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${versionId}/`));
      return response;
    });
  }

  async restoreVersion(versionId) {
    if (!versionId) throw new Error('Version ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(this.getEndpoint(`${versionId}/restore/`));
      return response;
    });
  }

  async compareVersions(versionAId, versionBId) {
    if (!versionAId || !versionBId) throw new Error('Both version IDs are required');
    return withRetry(async () => {
      const response = await this.apiClient.get(this.getEndpoint(`${versionAId}/diff/${versionBId}/`));
      return response;
    });
  }

  async validateHierarchy() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/hierarchy/validate/');
      return response;
    });
  }
  
  async detectCycles() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/hierarchy/detect-cycles/');
      return response;
    });
  }

  async autoCapture() {
    return withRetry(async () => {
      const response = await this.apiClient.post('/hierarchy/auto-capture/');
      return response;
    });
  }
  
  async getHealthMetrics() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/dashboard/hierarchy-health/');
      return response;
    });
  }

  async getHierarchyStats() {
    return withRetry(async () => {
      const response = await this.apiClient.get('/hierarchy/stats/');
      return response;
    });
  }
  
  async repairCycles(dryRun = true) {
    return withRetry(async () => {
      const response = await this.apiClient.post('/hierarchy/repair-cycles/', { dry_run: dryRun });
      return response;
    });
  }
}

export const hierarchyService = new HierarchyService();