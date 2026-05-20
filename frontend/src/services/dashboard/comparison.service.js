import { BaseDashboardService } from './dashboard.service';

class ComparisonService extends BaseDashboardService {
  constructor() {
    super('comparisons');
  }

  async getComparisons(filters = {}) {
    return this.withRetry(() => this.apiClient.get('/comparisons', { params: filters }));
  }

  async getComparisonById(comparisonId) {
    if (!comparisonId) throw new Error('Comparison ID is required');
    return this.withRetry(() => this.apiClient.get(`/comparisons/${comparisonId}`));
  }

  async createComparison(comparisonData) {
    if (!comparisonData) throw new Error('Comparison data is required');
    return this.withRetry(() => this.apiClient.post('/comparisons', comparisonData));
  }

  async updateComparison(comparisonId, comparisonData) {
    if (!comparisonId) throw new Error('Comparison ID is required');
    if (!comparisonData) throw new Error('Comparison data is required');
    return this.withRetry(() => this.apiClient.patch(`/comparisons/${comparisonId}`, comparisonData));
  }

  async deleteComparison(comparisonId) {
    if (!comparisonId) throw new Error('Comparison ID is required');
    return this.withRetry(() => this.apiClient.delete(`/comparisons/${comparisonId}`));
  }

  async calculateComparison(comparisonId) {
    if (!comparisonId) throw new Error('Comparison ID is required');
    return this.withRetry(() => this.apiClient.post(`/comparisons/${comparisonId}/calculate`));
  }
}

export const comparisonService = new ComparisonService();