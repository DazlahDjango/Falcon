import { BaseStructureService, withRetry } from './base.service';
import { HIERARCHY_ENDPOINTS } from '../../config/constants/structureApiConstants';

class HierarchyService extends BaseStructureService {
  constructor() {
    super('hierarchy');
  }

  async getCurrent() {
    const response = await withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.CURRENT));
    return this.unwrap(response);
  }

  async getHistory(limit) {
    const response = await withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.HISTORY, { params: { limit } }));
    return this.unwrap(response);
  }

  async capture(data) {
    if (!data) throw new Error('Capture data is required');
    const response = await withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.CAPTURE, data));
    return this.unwrap(response);
  }

  async autoCapture() {
    const response = await withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.AUTO_CAPTURE));
    return this.unwrap(response);
  }

  async restore(id) {
    if (!id) throw new Error('ID is required');
    const response = await withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.RESTORE(id)));
    return this.unwrap(response);
  }

  async diff(id, compareToId) {
    if (!id) throw new Error('ID is required');
    if (!compareToId) throw new Error('Compare ID is required');
    const response = await withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.DIFF(id, compareToId)));
    return this.unwrap(response);
  }

  async validate() {
    const response = await withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.VALIDATE));
    return this.unwrap(response);
  }
}

export const hierarchyService = new HierarchyService();
export { HierarchyService };