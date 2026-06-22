// src/services/reviews/supervisorReview.service.js
// Supervisor Review API service

import { BaseReviewsService } from './reviewsBase.service';

class SupervisorReviewService extends BaseReviewsService {
  constructor() {
    super('supervisor-reviews');
  }

  async submit(id) {
    return this.action(id, 'submit', { confirm_submit: true });
  }

  async saveDraft(id, data) {
    return this.action(id, 'save_draft', data);
  }

  async approve(id, comments = '') {
    return this.action(id, 'approve', { approve: true, comments });
  }

  async reject(id, reason) {
    return this.action(id, 'reject', { reason });
  }

  async requestChanges(id, feedback) {
    return this.action(id, 'request_changes', { feedback });
  }

  async resetToDraft(id) {
    return this.action(id, 'reset_to_draft');
  }

  async compareWithSelf(id) {
    const response = await this.apiClient.get(`/supervisor-reviews/${id}/compare/`);
    return response.data;
  }

  async getMyQueue() {
    const response = await this.apiClient.get('/supervisor-reviews/my-queue/');
    return response.data;
  }

  async getPendingApprovals() {
    const response = await this.apiClient.get('/supervisor-reviews/pending_approvals/');
    return response.data;
  }

  async getStats(cycleId) {
    const response = await this.apiClient.get('/supervisor-reviews/stats/', {
      params: { cycle_id: cycleId },
    });
    return response.data;
  }

  async getForCycle(cycleId) {
    return this.list({ review_cycle: cycleId });
  }

  async getForEmployee(employeeId, cycleId = null) {
    const params = cycleId ? { cycle_id: cycleId } : {};
    const response = await this.apiClient.get(`/supervisor-reviews/for-employee/${employeeId}/`, { params });
    return response.data;
  }
}

export const supervisorReviewService = new SupervisorReviewService();
export default supervisorReviewService;