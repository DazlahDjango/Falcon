// src/services/reviews/competency.service.js
// Competency and Competency Category API service

import { BaseReviewsService } from './reviewsBase.service';

class CompetencyCategoryService extends BaseReviewsService {
  constructor() {
    super('competency-categories');
  }

  async activate(id) {
    return this.action(id, 'activate');
  }

  async deactivate(id) {
    return this.action(id, 'deactivate');
  }

  async getCompetencies(id) {
    const response = await this.apiClient.get(`/competency-categories/${id}/competencies/`);
    return response.data;
  }
}

class CompetencyService extends BaseReviewsService {
  constructor() {
    super('competencies');
  }

  async activate(id) {
    return this.action(id, 'activate');
  }

  async deactivate(id) {
    return this.action(id, 'deactivate');
  }

  async getUsageStats(id) {
    const response = await this.apiClient.get(`/competencies/${id}/usage_stats/`);
    return response.data;
  }

  async getActive() {
    const response = await this.apiClient.get('/competencies/active/');
    return response.data;
  }

  async getRequired() {
    const response = await this.apiClient.get('/competencies/required/');
    return response.data;
  }

  async getByType(type) {
    const response = await this.apiClient.get(`/competencies/by-type/${type}/`);
    return response.data;
  }
}

class CompetencyRatingService extends BaseReviewsService {
  constructor() {
    super('competency-ratings');
  }

  async getByAssessment(assessmentId) {
    const response = await this.apiClient.get(`/competency-ratings/by-assessment/${assessmentId}/`);
    return response.data;
  }

  async getByReview(reviewId) {
    const response = await this.apiClient.get(`/competency-ratings/by-review/${reviewId}/`);
    return response.data;
  }

  async bulkCreate(parentId, parentType, ratings) {
    const response = await this.apiClient.post('/competency-ratings/bulk_create/', {
      parent_id: parentId,
      parent_type: parentType,
      ratings,
    });
    return response.data;
  }
}

export const competencyCategoryService = new CompetencyCategoryService();
export const competencyService = new CompetencyService();
export const competencyRatingService = new CompetencyRatingService();