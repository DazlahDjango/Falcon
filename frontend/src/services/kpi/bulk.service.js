import { BaseKPIService, withRetry } from './kpiBase.service';
import { BULK_ENDPOINTS } from '../api/endpoints';

class BulkService extends BaseKPIService {
  constructor() {
    super('bulk');
  }

  async uploadKPIs(file, dryRun = false) {
    if (!file) throw new Error('File is required');
    
    const formData = new FormData();
    formData.append('file', file);
    if (dryRun) formData.append('dry_run', 'true');
    
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.KPI_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    });
  }

  async uploadActuals(file, year, month, dryRun = false) {
    if (!file) throw new Error('File is required');
    if (!year) throw new Error('Year is required');
    if (!month) throw new Error('Month is required');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    formData.append('month', month);
    if (dryRun) formData.append('dry_run', 'true');
    
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.ACTUAL_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    });
  }

  async uploadTargets(file, year, dryRun = false) {
    if (!file) throw new Error('File is required');
    if (!year) throw new Error('Year is required');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    if (dryRun) formData.append('dry_run', 'true');
    
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.TARGET_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    });
  }

  async downloadTemplate(type) {
    if (!type) throw new Error('Template type is required (kpi, actual, target)');
    return withRetry(async () => {
      const response = await this.apiClient.get(BULK_ENDPOINTS.TEMPLATE(type), {
        responseType: 'blob',
      });
      return response;
    });
  }

  async createKPIsForm(items) {
    if (!items || items.length === 0) throw new Error('Items array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.FORM_CREATE_KPIS, { items });
      return response;
    });
  }

  async submitActualsForm(year, month, items) {
    if (!year || !month) throw new Error('Year and Month are required');
    if (!items || items.length === 0) throw new Error('Items array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.FORM_SUBMIT_ACTUALS, { year, month, items });
      return response;
    });
  }

  async submitCombinedForm(year, month, items) {
    if (!year || !month) throw new Error('Year and Month are required');
    if (!items || items.length === 0) throw new Error('Items array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(BULK_ENDPOINTS.FORM_SUBMIT_COMBINED, { year, month, items });
      return response;
    });
  }
}

export const bulkService = new BulkService();