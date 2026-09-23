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
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('my/')));
    return this.unwrap(response);
  }

  async getTeam() {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('team/')));
    return this.unwrap(response);
  }

  async getDistribution(cycleId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('distribution/'), {
      params: { cycle_id: cycleId },
    }));
    return this.unwrap(response);
  }

  async getStats(cycleId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), {
      params: { cycle_id: cycleId },
    }));
    return this.unwrap(response);
  }

  async exportRatings(cycleId, format = 'csv', includeDetails = false) {
    const response = await this.withRetry(() => this.apiClient.post(this.getEndpoint('export/'), {
      cycle_id: cycleId,
      format,
      include_details: includeDetails,
    }));
    return this.unwrap(response);
  }

  async getForCycle(cycleId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`for-cycle/${cycleId}/`)));
    return this.unwrap(response);
  }

  async getCycleRating(cycleId, ratingId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint(`${ratingId}/`)));
    return this.unwrap(response);
  }

  async approveCycleRating(cycleId, ratingId, notes = '') {
    return this.action(ratingId, 'approve', { approve: true, notes });
  }
}

export const finalRatingService = new FinalRatingService();
export default finalRatingService;