// src/services/reviews/cycle.service.js
// Review Cycle API service

import { BaseReviewsService } from './reviewsBase.service';

class ReviewCycleService extends BaseReviewsService {
  constructor() {
    super('cycles');
  }

  async activate(id) {
    return this.action(id, 'activate');
  }

  async freeze(id) {
    return this.action(id, 'freeze');
  }

  async complete(id) {
    return this.action(id, 'complete');
  }

  async forceComplete(id) {
    return this.action(id, 'force_complete');
  }

  async archive(id) {
    return this.action(id, 'archive');
  }

  async unarchive(id) {
    return this.action(id, 'unarchive');
  }

  async extend(id, newEndDate, reason) {
    return this.action(id, 'extend', { new_end_date: newEndDate, reason });
  }

  async sendReminders(id) {
    return this.action(id, 'send_reminders');
  }

  async getProgress(id) {
    const response = await this.apiClient.get(`/cycles/${id}/progress/`);
    return response.data;
  }

  async getParticipants(id) {
    const response = await this.apiClient.get(`/cycles/${id}/participants/`);
    return response.data;
  }

  async getSummary(id) {
    const response = await this.apiClient.get(`/cycles/${id}/summary/`);
    return response.data;
  }

  async getActive() {
    const response = await this.apiClient.get('/cycles/active/');
    return response.data;
  }

  async getUpcoming() {
    const response = await this.apiClient.get('/cycles/upcoming/');
    return response.data;
  }

  async getCompleted() {
    const response = await this.apiClient.get('/cycles/completed/');
    return response.data;
  }

  async getArchived() {
    const response = await this.apiClient.get('/cycles/archived/');
    return response.data;
  }

  async getMyCycles() {
    const response = await this.apiClient.get('/cycles/my_cycles/');
    return response.data;
  }

  async getByYear(year) {
    const response = await this.apiClient.get(`/cycles/by-year/${year}/`);
    return response.data;
  }

  async filterByDateRange(dateFrom, dateTo, cycleType, status) {
    const response = await this.apiClient.post('/cycles/date_range/', {
      date_from: dateFrom,
      date_to: dateTo,
      cycle_type: cycleType,
      status,
    });
    return response.data;
  }
}

export const reviewCycleService = new ReviewCycleService();
export default reviewCycleService;