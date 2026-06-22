// src/services/reviews/pip.service.js
// PIP, PIP Action, and PIP Review API services

import { BaseReviewsService } from './reviewsBase.service';

class PIPService extends BaseReviewsService {
  constructor() {
    super('pips');
  }

  async approve(id) {
    return this.action(id, 'approve', { approve: true });
  }

  async start(id) {
    return this.action(id, 'start');
  }

  async extend(id, newEndDate, reason) {
    return this.action(id, 'extend', { new_end_date: newEndDate, reason });
  }

  async complete(id, outcome, notes = '') {
    return this.action(id, 'complete', { outcome, notes });
  }

  async cancel(id) {
    return this.action(id, 'cancel');
  }

  async getProgress(id) {
    const response = await this.apiClient.get(`/pips/${id}/progress/`);
    return response.data;
  }

  async addAction(id, actionData) {
    return this.action(id, 'add_action', actionData);
  }

  async addReview(id, reviewData) {
    return this.action(id, 'add_review', reviewData);
  }

  async getFullReport(id) {
    const response = await this.apiClient.get(`/pips/${id}/full_report/`);
    return response.data;
  }

  async getMy() {
    const response = await this.apiClient.get('/pips/my/');
    return response.data;
  }

  async getManaging() {
    const response = await this.apiClient.get('/pips/managing/');
    return response.data;
  }

  async getTeam() {
    const response = await this.apiClient.get('/pips/team/');
    return response.data;
  }

  async getActive() {
    const response = await this.apiClient.get('/pips/active/');
    return response.data;
  }

  async getOverdue() {
    const response = await this.apiClient.get('/pips/overdue/');
    return response.data;
  }

  async getReport() {
    const response = await this.apiClient.get('/pips/report/');
    return response.data;
  }

  async getTrends(months = 6) {
    const response = await this.apiClient.get('/pips/trends/', {
      params: { months },
    });
    return response.data;
  }

  async getForEmployee(employeeId) {
    const response = await this.apiClient.get(`/pips/for-employee/${employeeId}/`);
    return response.data;
  }

  async generateFromRating(ratingId, customData = null) {
    const response = await this.apiClient.post(`/pips/generate-from-rating/${ratingId}/`, {
      custom_data: customData,
    });
    return response.data;
  }
}

class PIPActionService extends BaseReviewsService {
  constructor() {
    super('pip-actions');
  }

  async complete(id, notes = '', evidence = null) {
    const data = { notes };
    if (evidence) data.evidence = evidence;
    return this.action(id, 'complete', data);
  }

  async verify(id) {
    return this.action(id, 'verify', { verified: true });
  }

  async reopen(id) {
    return this.action(id, 'reopen');
  }

  async getForPIP(pipId) {
    const response = await this.apiClient.get(`/pip-actions/for-pip/${pipId}/`);
    return response.data;
  }
}

class PIPReviewService extends BaseReviewsService {
  constructor() {
    super('pip-reviews');
  }

  async getForPIP(pipId) {
    const response = await this.apiClient.get(`/pip-reviews/for-pip/${pipId}/`);
    return response.data;
  }
}

export const pipService = new PIPService();
export const pipActionService = new PIPActionService();
export const pipReviewService = new PIPReviewService();