import { BaseStructureService, withRetry } from './base.service';
import { HIERARCHY_ENDPOINTS } from '../../config/constants/structureApiConstants';

class HierarchyService extends BaseStructureService {
  constructor() {
    super('hierarchy');
  }

  async getCurrent() {
    return withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.CURRENT));
  }

  async getHistory(limit) {
    return withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.HISTORY, { params: { limit } }));
  }

  async capture(data) {
    if (!data) throw new Error('Capture data is required');
    return withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.CAPTURE, data));
  }

  async autoCapture() {
    return withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.AUTO_CAPTURE));
  }

  async restore(id) {
    if (!id) throw new Error('ID is required');
    return withRetry(() => this.apiClient.post(HIERARCHY_ENDPOINTS.RESTORE(id)));
  }

  async diff(id, compareToId) {
    if (!id) throw new Error('ID is required');
    if (!compareToId) throw new Error('Compare ID is required');
    return withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.DIFF(id, compareToId)));
  }

  async validate() {
    return withRetry(() => this.apiClient.get(HIERARCHY_ENDPOINTS.VALIDATE));
  }
}

export const hierarchyService = new HierarchyService();
export { HierarchyService };