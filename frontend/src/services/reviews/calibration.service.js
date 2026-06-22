// src/services/reviews/calibration.service.js
// Calibration API service

import { BaseReviewsService } from './reviewsBase.service';

class CalibrationSessionService extends BaseReviewsService {
  constructor() {
    super('calibration-sessions');
  }

  async start(id) {
    return this.action(id, 'start', { start: true });
  }

  async complete(id, decisions = '', notes = '') {
    return this.action(id, 'complete', { decisions, notes });
  }

  async cancel(id) {
    return this.action(id, 'cancel');
  }

  async addRating(sessionId, finalRatingId, beforeScore, afterScore, reason) {
    const response = await this.apiClient.post(`/calibration-sessions/${sessionId}/add-rating/`, {
      final_rating: finalRatingId,
      before_score: beforeScore,
      after_score: afterScore,
      adjustment_reason: reason,
    });
    return response.data;
  }

  async addComment(sessionId, comment, parentCommentId = null) {
    const response = await this.apiClient.post(`/calibration-sessions/${sessionId}/add-comment/`, {
      comment,
      parent_comment_id: parentCommentId,
    });
    return response.data;
  }

  async getReport(id) {
    const response = await this.apiClient.get(`/calibration-sessions/${id}/report/`);
    return response.data;
  }

  async getMy() {
    const response = await this.apiClient.get('/calibration-sessions/my/');
    return response.data;
  }

  async getOutliers(cycleId) {
    const response = await this.apiClient.get('/calibration-sessions/outliers/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getRecommendations(cycleId) {
    const response = await this.apiClient.get('/calibration-sessions/calibration_recommendations/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getForCycle(cycleId) {
    const response = await this.apiClient.get(`/calibration-sessions/for-cycle/${cycleId}/`);
    return response.data;
  }
}

class CalibrationRatingService extends BaseReviewsService {
  constructor() {
    super('calibration-ratings');
  }

  async getForSession(sessionId) {
    const response = await this.apiClient.get(`/calibration-ratings/for-session/${sessionId}/`);
    return response.data;
  }
}

export const calibrationSessionService = new CalibrationSessionService();
export const calibrationRatingService = new CalibrationRatingService();