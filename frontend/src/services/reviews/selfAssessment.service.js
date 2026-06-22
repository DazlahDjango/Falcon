// src/services/reviews/selfAssessment.service.js
// Self Assessment API service

import { BaseReviewsService } from './reviewsBase.service';

class SelfAssessmentService extends BaseReviewsService {
  constructor() {
    super('self-assessments');
  }

  async submit(id) {
    return this.action(id, 'submit', { confirm_submit: true });
  }

  async saveDraft(id, data) {
    return this.action(id, 'save_draft', data);
  }

  async resetToDraft(id) {
    return this.action(id, 'reset_to_draft');
  }

  async softDelete(id) {
    return this.action(id, 'soft_delete');
  }

  async restore(id) {
    return this.action(id, 'restore');
  }

  async getMy() {
    const response = await this.apiClient.get('/self-assessments/my/');
    return response.data;
  }

  async getTeam() {
    const response = await this.apiClient.get('/self-assessments/team/');
    return response.data;
  }

  async getPending() {
    const response = await this.apiClient.get('/self-assessments/pending/');
    return response.data;
  }

  async getSubmitted() {
    const response = await this.apiClient.get('/self-assessments/submitted/');
    return response.data;
  }

  async getStats(cycleId) {
    const response = await this.apiClient.get('/self-assessments/stats/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getForCycle(cycleId) {
    return this.list({ review_cycle: cycleId });
  }
}

export const selfAssessmentService = new SelfAssessmentService();
export default selfAssessmentService;