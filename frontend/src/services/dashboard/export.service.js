import { BaseDashboardService } from './dashboard.service';

class ExportService extends BaseDashboardService {
  constructor() {
    super('exports');
  }

  async getExports(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/exports', { params: filters }));
  }

  async getExportById(exportId) {
    if (!exportId) throw new Error('Export ID is required');
    return this.withRetry(() => this.apiClient.get(`/exports/${exportId}`));
  }

  async createExport(exportData) {
    if (!exportData) throw new Error('Export data is required');
    return this.withRetry(() => this.apiClient.post('/exports', exportData));
  }

  async updateExport(exportId, exportData) {
    if (!exportId) throw new Error('Export ID is required');
    if (!exportData) throw new Error('Export data is required');
    return this.withRetry(() => this.apiClient.patch(`/exports/${exportId}`, exportData));
  }

  async deleteExport(exportId) {
    if (!exportId) throw new Error('Export ID is required');
    return this.withRetry(() => this.apiClient.delete(`/exports/${exportId}`));
  }

  async triggerExport(exportId) {
    if (!exportId) throw new Error('Export ID is required');
    return this.withRetry(() => this.apiClient.post(`/exports/${exportId}/trigger`));
  }

  async downloadExport(exportId) {
    if (!exportId) throw new Error('Export ID is required');
    const response = await this.withRetry(() => this.apiClient.get(`/exports/${exportId}/download`, {
      responseType: 'blob'
    }));
    return response;
  }

  async getExportHistory() {
    return this.withRetry(() => this.apiClient.get('/exports/history'));
  }
}

export const exportService = new ExportService();