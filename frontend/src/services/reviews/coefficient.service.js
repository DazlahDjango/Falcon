// src/services/reviews/coefficient.service.js
// Coefficient API service

import { BaseReviewsService } from './reviewsBase.service';

class CoefficientService extends BaseReviewsService {
  constructor() {
    super('coefficients');
  }

  async activate(id) {
    const response = await this.action(id, 'activate');
    return this.unwrap(response);
  }

  async deactivate(id) {
    const response = await this.action(id, 'deactivate');
    return this.unwrap(response);
  }

  async getActive() {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('active/')));
    return this.unwrap(response);
  }

  async applyCoefficient(score, coefficientValue) {
    const response = await this.withRetry(() => this.apiClient.post(this.getEndpoint('apply/'), {
      score,
      coefficient_value: coefficientValue,
    }));
    return this.unwrap(response);
  }

  async getByDepartment(departmentId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`by-department/${departmentId}/`)));
    return this.unwrap(response);
  }

  async getByPosition(positionId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`by-position/${positionId}/`)));
    return this.unwrap(response);
  }

  async getByUser(userId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`by-user/${userId}/`)));
    return this.unwrap(response);
  }
}

export const coefficientService = new CoefficientService();
export default coefficientService;