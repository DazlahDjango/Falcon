// src/services/reviews/reviewsBase.service.js
// Base service class for all reviews services
// Uses shared API client from services/api

import { reviewsApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

/**
 * Base class for Reviews API services
 * Extends BaseResourceService with Reviews-specific configuration
 * 
 * @example
 * class RatingScaleService extends BaseReviewsService {
 *   constructor() {
 *     super('rating-scales');
 *   }
 * }
 */
class BaseReviewsService extends BaseResourceService {
  constructor(resourceName, options = {}) {
    super(resourceName, {
      client: reviewsApiClient,
      withRetry,
      logLabel: 'Reviews',
      ...options,
    });
  }

  /**
   * Get endpoint with optional custom path
   * Override to handle nested routes differently
   */
  getEndpoint(endpoint = '') {
    if (endpoint.startsWith('/')) {
      return endpoint;
    }
    return endpoint ? `/${this.resourceName}/${endpoint}` : `/${this.resourceName}/`;
  }

  /**
   * Execute a custom action on a resource
   * @param {string} id - Resource ID
   * @param {string} action - Action name (e.g., 'activate', 'deactivate')
   * @param {Object} data - Optional data for the action
   * @returns {Promise<Object>} Action response
   */
  async action(id, action, data = {}) {
    if (!id) throw new Error('ID is required for action');
    if (!action) throw new Error('Action name is required');
    
    const response = await this.withRetry(() => 
      this.apiClient.post(this.getEndpoint(`${id}/${action}/`), data),
      { logLabel: this.logLabel }
    );
    return this.unwrap(response);
  }

  /**
   * Get stats for a resource
   * @param {Object} params - Query parameters (e.g., cycle_id)
   * @returns {Promise<Object>} Statistics
   */
  async getStats(params = {}) {
    const response = await this.withRetry(() => 
      this.apiClient.get(this.getEndpoint('stats/'), { params }),
      { logLabel: this.logLabel }
    );
    return this.unwrap(response);
  }

  /**
   * Export resource data
   * @param {string} format - Export format (csv, excel, pdf)
   * @param {Object} params - Query parameters
   * @returns {Promise<Blob|Object>} Exported data
   */
  async exportData(format = 'csv', params = {}) {
    return this.withRetry(() =>
      this.apiClient.post(this.getEndpoint('export/'), { format, ...params }, {
        responseType: format === 'json' ? 'json' : 'blob',
      }),
      { logLabel: this.logLabel }
    );
  }
}

// Export the base class and shared client
export { BaseReviewsService, reviewsApiClient, withRetry };
export default BaseReviewsService;