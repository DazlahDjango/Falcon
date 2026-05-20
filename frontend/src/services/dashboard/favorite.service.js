import { BaseDashboardService } from './dashboard.service';

class FavoriteService extends BaseDashboardService {
  constructor() {
    super('favorites');
  }

  async getFavorites() {
    return this.withRetry(() => this.apiClient.get('/favorites'));
  }

  async addFavorite(kpiId, kpiName, notes = '') {
    if (!kpiId) throw new Error('KPI ID is required');
    if (!kpiName) throw new Error('KPI name is required');
    return this.withRetry(() => this.apiClient.post('/favorites', { kpi_id: kpiId, kpi_name: kpiName, notes }));
  }

  async removeFavorite(favoriteId) {
    if (!favoriteId) throw new Error('Favorite ID is required');
    return this.withRetry(() => this.apiClient.delete(`/favorites/${favoriteId}`));
  }

  async reorderFavorites(favoriteIds) {
    if (!favoriteIds || !favoriteIds.length) throw new Error('Favorite IDs are required');
    return this.withRetry(() => this.apiClient.post('/favorites/reorder', { favorite_ids: favoriteIds }));
  }
}

export const favoriteService = new FavoriteService();