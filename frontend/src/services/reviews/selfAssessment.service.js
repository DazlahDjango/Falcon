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
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('my/')));
    return this.unwrap(response);
  }

  async getTeam() {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('team/')));
    return this.unwrap(response);
  }

  async getPending() {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('pending/')));
    return this.unwrap(response);
  }

  async getSubmitted() {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('submitted/')));
    return this.unwrap(response);
  }

  async getStats(cycleId) {
    const response = await this.withRetry(() => this.apiClient.get(this.getEndpoint('stats/'), {
      params: { cycle_id: cycleId },
    }));
    return this.unwrap(response);
  }

  async getForCycle(cycleId) {
    return this.list({ review_cycle: cycleId });
  }
}

export const selfAssessmentService = new SelfAssessmentService();
export default selfAssessmentService;