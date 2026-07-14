import { BaseKPIService, withRetry } from './kpiBase.service';
import { CATEGORY_ENDPOINTS } from '../api/endpoints';

class FrameworkService extends BaseKPIService {
  constructor() {
    super('categories');
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
}

export const frameworkService = new FrameworkService();