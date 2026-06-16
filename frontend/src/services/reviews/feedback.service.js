// src/services/reviews/feedback.service.js
// 360 Feedback API service

import { BaseReviewsService } from './reviewsBase.service';

class FeedbackRequestService extends BaseReviewsService {
  constructor() {
    super('feedback-requests');
  }

  async remind(id) {
    return this.action(id, 'remind');
  }

  async cancel(id) {
    return this.action(id, 'cancel');
  }

  async bulkCreate(reviewers, subjectId, cycleId, reviewerType, dueDate) {
    const response = await this.apiClient.post('/feedback-requests/bulk_create/', {
      reviewers,
      subject_id: subjectId,
      cycle_id: cycleId,
      reviewer_type: reviewerType,
      due_date: dueDate,
    });
    return response.data;
  }

  async getPending() {
    const response = await this.apiClient.get('/feedback-requests/pending/');
    return response.data;
  }

  async getOverdue() {
    const response = await this.apiClient.get('/feedback-requests/overdue/');
    return response.data;
  }

  async getForSubject(subjectId) {
    const response = await this.apiClient.get(`/feedback-requests/for-subject/${subjectId}/`);
    return response.data;
  }

  async getForCycle(cycleId) {
    const response = await this.apiClient.get(`/feedback-requests/for-cycle/${cycleId}/`);
    return response.data;
  }
}

class FeedbackResponseService extends BaseReviewsService {
  constructor() {
    super('feedback-responses');
  }

  async submit(requestId, data) {
    const response = await this.apiClient.post(`/feedback-responses/submit/${requestId}/`, data);
    return response.data;
  }

  async getForRequest(requestId) {
    const response = await this.apiClient.get(`/feedback-responses/for-request/${requestId}/`);
    return response.data;
  }

  async getForSubject(subjectId) {
    const response = await this.apiClient.get(`/feedback-responses/for-subject/${subjectId}/`);
    return response.data;
  }
}

class FeedbackSummaryService extends BaseReviewsService {
  constructor() {
    super('feedback-summaries');
  }

  async share(id) {
    return this.action(id, 'share', { share: true });
  }

  async regenerate(id) {
    return this.action(id, 'regenerate');
  }

  async getMy() {
    const response = await this.apiClient.get('/feedback-summaries/my/');
    return response.data;
  }

  async getForCycle(cycleId) {
    const response = await this.apiClient.get(`/feedback-summaries/for-cycle/${cycleId}/`);
    return response.data;
  }
}

export const feedbackRequestService = new FeedbackRequestService();
export const feedbackResponseService = new FeedbackResponseService();
export const feedbackSummaryService = new FeedbackSummaryService();