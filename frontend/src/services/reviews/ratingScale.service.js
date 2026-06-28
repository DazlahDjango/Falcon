// src/services/reviews/ratingScale.service.js
import { BaseReviewsService } from './reviewsBase.service';

class RatingScaleService extends BaseReviewsService {
  constructor() {
    super('rating-scales');
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

  async getDefault() {
    const response = await this.apiClient.get('/rating-scales/default/');
    return response.data;
  }

  async getActiveScales() {
    const response = await this.apiClient.get('/rating-scales/active_scales/');
    return response.data;
  }

  async convertScore(ratingScaleId, score, fromType, toType) {
    const response = await this.apiClient.post('/rating-scales/convert/', {
      rating_scale_id: ratingScaleId,
      score,
      from_type: fromType,
      to_type: toType,
    });
    return response.data;
  }
}

export const ratingScaleService = new RatingScaleService();
export default ratingScaleService;