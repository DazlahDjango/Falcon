// src/services/reviews/finalRating.service.js
// Final Rating API service

import { BaseReviewsService } from './reviewsBase.service';

class FinalRatingService extends BaseReviewsService {
  constructor() {
    super('final-ratings');
  }

  async approve(id, notes = '') {
    return this.action(id, 'approve', { approve: true, notes });
  }

  async lock(id) {
    return this.action(id, 'lock', { lock: true });
  }

  async forceLock(id) {
    return this.action(id, 'force_lock');
  }

  async calibrate(id, adjustedScore, reason) {
    return this.action(id, 'calibrate', { adjusted_score: adjustedScore, reason });
  }

  async recalibrate(id) {
    return this.action(id, 'recalibrate');
  }

  async recalculate(id) {
    return this.action(id, 'recalculate');
  }

  async generatePip(id) {
    return this.action(id, 'generate_pip');
  }

  async generatePromotion(id) {
    return this.action(id, 'generate_promotion');
  }

  async getMy() {
    const response = await this.apiClient.get('/final-ratings/my/');
    return response.data;
  }

  async getTeam() {
    const response = await this.apiClient.get('/final-ratings/team/');
    return response.data;
  }

  async getDistribution(cycleId) {
    const response = await this.apiClient.get('/final-ratings/distribution/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getStats(cycleId) {
    const response = await this.apiClient.get('/final-ratings/stats/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async exportRatings(cycleId, format = 'csv', includeDetails = false) {
    const response = await this.apiClient.post('/final-ratings/export/', {
      cycle_id: cycleId,
      format,
      include_details: includeDetails,
    });
    return response.data;
  }

  async getForCycle(cycleId) {
    const response = await this.apiClient.get(`/cycles/${cycleId}/final-ratings/`);
    return response.data;
  }

  async getCycleRating(cycleId, ratingId) {
    const response = await this.apiClient.get(`/cycles/${cycleId}/final-ratings/${ratingId}/`);
    return response.data;
  }

  async approveCycleRating(cycleId, ratingId, notes = '') {
    const response = await this.apiClient.post(`/cycles/${cycleId}/final-ratings/${ratingId}/approve/`, {
      approve: true,
      notes,
    });
    return response.data;
  }
}

export const finalRatingService = new FinalRatingService();
export default finalRatingService;