// src/services/reviews/template.service.js
// Review Template API service

import { BaseReviewsService } from './reviewsBase.service';

class ReviewTemplateService extends BaseReviewsService {
  constructor() {
    super('templates');
  }

  async setDefault(id) {
    return this.action(id, 'set_default');
  }

  async activate(id) {
    return this.action(id, 'activate');
  }

  async deactivate(id) {
    return this.action(id, 'deactivate');
  }

  async duplicate(id) {
    return this.action(id, 'duplicate');
  }

  async getDefault() {
    const response = await this.withRetry(() =>
      this.apiClient.get(this.getEndpoint('default/')),
      { logLabel: this.logLabel }
    );
    return this.unwrap(response);
  }

  async getActive() {
    const response = await this.withRetry(() =>
      this.apiClient.get(this.getEndpoint('active/')),
      { logLabel: this.logLabel }
    );
    return this.unwrap(response);
  }
}

export const reviewTemplateService = new ReviewTemplateService();
export default reviewTemplateService;