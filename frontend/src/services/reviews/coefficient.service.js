// src/services/reviews/coefficient.service.js
// Coefficient API service

import { BaseReviewsService } from './reviewsBase.service';

class CoefficientService extends BaseReviewsService {
  constructor() {
    super('coefficients');
  }

  async activate(id) {
    return this.action(id, 'activate');
  }

  async deactivate(id) {
    return this.action(id, 'deactivate');
  }

  async getActive() {
    const response = await this.apiClient.get('/coefficients/active/');
    return response.data;
  }

  async applyCoefficient(score, coefficientValue) {
    const response = await this.apiClient.post('/coefficients/apply/', {
      score,
      coefficient_value: coefficientValue,
    });
    return response.data;
  }

  async getByDepartment(departmentId) {
    const response = await this.apiClient.get(`/coefficients/by-department/${departmentId}/`);
    return response.data;
  }

  async getByPosition(positionId) {
    const response = await this.apiClient.get(`/coefficients/by-position/${positionId}/`);
    return response.data;
  }

  async getByUser(userId) {
    const response = await this.apiClient.get(`/coefficients/by-user/${userId}/`);
    return response.data;
  }
}

export const coefficientService = new CoefficientService();
export default coefficientService;