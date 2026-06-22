// src/services/reviews/systemSettings.service.js
import { reviewsApiClient } from '../api';

class ReviewsSystemSettingsService {
  async getSettings() {
    const response = await reviewsApiClient.get('/system-settings/');
    return response.data;
  }

  async updateSettings(settings) {
    const response = await reviewsApiClient.patch('/system-settings/', settings);
    return response.data;
  }

  async resetSettings() {
    const response = await reviewsApiClient.post('/system-settings/reset/');
    return response.data;
  }
}

export const reviewsSystemSettingsService = new ReviewsSystemSettingsService();
export default reviewsSystemSettingsService;