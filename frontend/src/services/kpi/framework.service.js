import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  SECTOR_ENDPOINTS,
  FRAMEWORK_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  TEMPLATE_ENDPOINTS,
} from '../api/endpoints';

class FrameworkService extends BaseKPIService {
  constructor() {
    super('frameworks');
  }

  // ============ SECTORS ============
  async getSectors(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SECTOR_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getSector(id) {
    if (!id) throw new Error('Sector ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SECTOR_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createSector(data) {
    if (!data) throw new Error('Sector data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(SECTOR_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateSector(id, data) {
    if (!id) throw new Error('Sector ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(SECTOR_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteSector(id) {
    if (!id) throw new Error('Sector ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(SECTOR_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async getSectorFrameworks(id, params = {}) {
    if (!id) throw new Error('Sector ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SECTOR_ENDPOINTS.FRAMEWORKS(id), { params });
      return response;
    });
  }

  // ============ FRAMEWORKS ============
  async getFrameworks(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(FRAMEWORK_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getFramework(id) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(FRAMEWORK_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createFramework(data) {
    if (!data) throw new Error('Framework data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(FRAMEWORK_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateFramework(id, data) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(FRAMEWORK_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteFramework(id) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(FRAMEWORK_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async publishFramework(id) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(FRAMEWORK_ENDPOINTS.PUBLISH(id));
      return response;
    });
  }

  async archiveFramework(id) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(FRAMEWORK_ENDPOINTS.ARCHIVE(id));
      return response;
    });
  }

  async duplicateFramework(id) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(FRAMEWORK_ENDPOINTS.DUPLICATE(id));
      return response;
    });
  }

  async getFrameworkCategories(id, params = {}) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(FRAMEWORK_ENDPOINTS.CATEGORIES(id), { params });
      return response;
    });
  }

  async getFrameworkKPIs(id, params = {}) {
    if (!id) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(FRAMEWORK_ENDPOINTS.KPIS(id), { params });
      return response;
    });
  }

  // ============ CATEGORIES ============
  async getCategories(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(CATEGORY_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getCategory(id) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CATEGORY_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createCategory(data) {
    if (!data) throw new Error('Category data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CATEGORY_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateCategory(id, data) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(CATEGORY_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteCategory(id) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(CATEGORY_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async getCategoryChildren(id) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CATEGORY_ENDPOINTS.CHILDREN(id));
      return response;
    });
  }

  async getCategoryKPIs(id, params = {}) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(CATEGORY_ENDPOINTS.KPIS(id), { params });
      return response;
    });
  }

  async moveCategory(id, parentId) {
    if (!id) throw new Error('Category ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CATEGORY_ENDPOINTS.MOVE(id), { parent_id: parentId });
      return response;
    });
  }

  async reorderCategories(categories) {
    if (!categories || !categories.length) throw new Error('Categories array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(CATEGORY_ENDPOINTS.REORDER, { categories });
      return response;
    });
  }

  // ============ TEMPLATES ============
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

  async publishTemplate(id) {
    if (!id) throw new Error('Template ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TEMPLATE_ENDPOINTS.PUBLISH(id));
      return response;
    });
  }

  async useTemplate(id, frameworkId) {
    if (!id) throw new Error('Template ID is required');
    if (!frameworkId) throw new Error('Framework ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(TEMPLATE_ENDPOINTS.USE_TEMPLATE(id), { framework_id: frameworkId });
      return response;
    });
  }
}

export const frameworkService = new FrameworkService();