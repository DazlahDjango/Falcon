// src/services/reviews/comment.service.js
// Review Comment API service

import { BaseReviewsService } from './reviewsBase.service';

class ReviewCommentService extends BaseReviewsService {
  constructor() {
    super('comments');
  }

  async resolve(id) {
    return this.action(id, 'resolve', { resolve: true });
  }

  async unresolve(id) {
    return this.action(id, 'unresolve');
  }

  async edit(id, comment) {
    return this.action(id, 'edit', { comment });
  }

  async getForObject(contentType, objectId) {
    const response = await this.apiClient.get('/comments/for-object/', {
      params: { content_type: contentType, object_id: objectId },
    });
    return response.data;
  }

  async getReplies(parentId) {
    const response = await this.apiClient.get(`/comments/replies/${parentId}/`);
    return response.data;
  }
}

export const reviewCommentService = new ReviewCommentService();
export default reviewCommentService;