// src/services/reviews/promotion.service.js
// Promotion Recommendation API service

import { BaseReviewsService } from './reviewsBase.service';

class PromotionService extends BaseReviewsService {
  constructor() {
    super('promotions');
  }

  async approve(id, notes = '', targetDate = null) {
    return this.action(id, 'approve', { approve: true, notes, target_date: targetDate });
  }

  async reject(id, reason) {
    return this.action(id, 'reject', { reason });
  }

  async complete(id, actualDate = null, newSalary = null) {
    return this.action(id, 'complete', { actual_date: actualDate, new_salary: newSalary });
  }

  async hold(id, reason = '') {
    return this.action(id, 'hold', { reason });
  }

  async getPending() {
    const response = await this.apiClient.get('/promotions/pending/');
    return response.data;
  }

  async getApproved() {
    const response = await this.apiClient.get('/promotions/approved/');
    return response.data;
  }

  async getCompleted() {
    const response = await this.apiClient.get('/promotions/completed/');
    return response.data;
  }

  async getStats(year = null) {
    const response = await this.apiClient.get('/promotions/stats/', {
      params: year ? { year } : {},
    });
    return response.data;
  }

  async getForEmployee(employeeId) {
    const response = await this.apiClient.get(`/promotions/for-employee/${employeeId}/`);
    return response.data;
  }

  async generateFromRating(ratingId) {
    const response = await this.apiClient.post(`/promotions/generate-from-rating/${ratingId}/`);
    return response.data;
  }
}

export const promotionService = new PromotionService();
export default promotionService;