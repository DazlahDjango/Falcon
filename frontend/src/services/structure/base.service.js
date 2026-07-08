import { structureApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseStructureService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, { client: structureApiClient, withRetry, logLabel: 'Structure' });
  }

  /**
   * Unwrap envelope response from API
   * Structure API uses responseStyle: 'envelope' which returns:
   * { success: true, data: actualData, status: 200, message: 'Success' }
   */
  unwrap(response) {
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return response.data;
    }
    return response;
  }

  /**
   * Override list to unwrap envelope
   */
  async list(params = {}) {
    const response = await super.list(params);
    return this.unwrap(response);
  }

  /**
   * Override getById to unwrap envelope
   */
  async getById(id, params = {}) {
    const response = await super.getById(id, params);
    return this.unwrap(response);
  }

  /**
   * Override create to unwrap envelope
   */
  async create(data) {
    const response = await super.create(data);
    return this.unwrap(response);
  }

  /**
   * Override update to unwrap envelope
   */
  async update(id, data, partial = true) {
    const response = await super.update(id, data, partial);
    return this.unwrap(response);
  }

  /**
   * Override delete to unwrap envelope
   */
  async delete(id) {
    const response = await super.delete(id);
    return this.unwrap(response);
  }

  /**
   * Override getStats to unwrap envelope
   */
  async getStats(params = {}) {
    const response = await super.getStats(params);
    return this.unwrap(response);
  }

  /**
   * Override exportData to unwrap envelope
   */
  async exportData(format = 'csv', params = {}) {
    const response = await super.exportData(format, params);
    return this.unwrap(response);
  }
}

export { structureApiClient as apiClient, withRetry, BaseStructureService };
export default BaseStructureService;