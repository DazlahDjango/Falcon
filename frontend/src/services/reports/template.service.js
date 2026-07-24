import { ReportBaseService, withRetry } from './reportBase.service';
import { TEMPLATE_ENDPOINTS } from '../../config/constants/reportApiConstants';

class TemplateService extends ReportBaseService {
  constructor() {
    super('templates');
  }

  async getTemplates(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getTemplate(id) {
    if (!id) throw new Error('Template ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createTemplate(data) {
    if (!data) throw new Error('Template data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TEMPLATE_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateTemplate(id, data) {
    if (!id) throw new Error('Template ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(TEMPLATE_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteTemplate(id) {
    if (!id) throw new Error('Template ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(TEMPLATE_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async performAction(id, action, data = {}) {
    if (!id) throw new Error('Template ID is required');
    if (!action) throw new Error('Action is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TEMPLATE_ENDPOINTS.ACTION(id), { action, ...data });
      return response;
    });
  }

  async applyTemplate(id, reportId) {
    if (!id) throw new Error('Template ID is required');
    if (!reportId) throw new Error('Report ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TEMPLATE_ENDPOINTS.APPLY(id), { report_id: reportId });
      return response;
    });
  }

  async getPrebuiltTemplates() {
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.PREBUILT);
      return response;
    });
  }

  async getDefaultTemplates() {
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.DEFAULT);
      return response;
    });
  }

  async getPopularTemplates() {
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.POPULAR);
      return response;
    });
  }

  async getTemplatesBySector(sector) {
    if (!sector) throw new Error('Sector is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.BY_SECTOR(sector));
      return response;
    });
  }

  async getTemplateTypes() {
    return withRetry(async () => {
      const response = await this.apiClient.get(TEMPLATE_ENDPOINTS.TYPES);
      return response;
    });
  }
}

export const templateService = new TemplateService();
