// src/services/reviews/referenceData.service.js
import { reviewsApiClient } from '../api';

class ReviewsReferenceDataService {
  async getReferenceData(include = ['users', 'departments', 'teams', 'positions', 'metrics']) {
    const response = await reviewsApiClient.get('/reference-data/', {
      params: { include: include.join(',') },
    });
    return response.data;
  }

  async getUsers() {
    return this.getReferenceData(['users']);
  }

  async getDepartments() {
    return this.getReferenceData(['departments']);
  }

  async getTeams() {
    return this.getReferenceData(['teams']);
  }

  async getPositions() {
    return this.getReferenceData(['positions']);
  }

  async getMetrics() {
    return this.getReferenceData(['metrics']);
  }

  async getAll() {
    return this.getReferenceData(['users', 'departments', 'teams', 'positions', 'metrics']);
  }
}

export const reviewsReferenceDataService = new ReviewsReferenceDataService();
export default reviewsReferenceDataService;