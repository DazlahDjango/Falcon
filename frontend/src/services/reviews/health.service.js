// src/services/reviews/health.service.js
// Health, Metrics, Reference Data API service

import { reviewsApiClient } from '../api';

class ReviewsHealthService {
  async healthCheck() {
    const response = await reviewsApiClient.get('/health/');
    return response.data;
  }

  async getMetrics() {
    const response = await reviewsApiClient.get('/dashboard/metrics/');
    return response.data;
  }

  async getReferenceData(include = ['users', 'departments', 'teams', 'positions', 'metrics']) {
    const response = await reviewsApiClient.get('/reference-data/', {
      params: { include: include.join(',') },
    });
    return response.data;
  }

  async getSystemSettings() {
    const response = await reviewsApiClient.get('/system-settings/');
    return response.data;
  }

  async updateSystemSettings(settings) {
    const response = await reviewsApiClient.patch('/system-settings/', settings);
    return response.data;
  }

  async resetSystemSettings() {
    const response = await reviewsApiClient.post('/system-settings/reset/');
    return response.data;
  }
}

export const reviewsHealthService = new ReviewsHealthService();
export default reviewsHealthService;