import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  SCORE_ENDPOINTS,
  AGGREGATED_SCORE_ENDPOINTS,
  TRAFFIC_LIGHT_ENDPOINTS,
} from '../api/endpoints';

class ScoreService extends BaseKPIService {
  constructor() {
    super('scores');
  }

  // ============ Scores ============
  async getScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCORE_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getScore(id) {
    if (!id) throw new Error('Score ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(SCORE_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async getMyScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCORE_ENDPOINTS.MY_SCORES, { params });
      return response;
    });
  }

  async getTeamScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCORE_ENDPOINTS.TEAM_SCORES, { params });
      return response;
    });
  }

  async getScoreStatistics(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(SCORE_ENDPOINTS.STATISTICS, { params });
      return response;
    });
  }

  // ============ Aggregated Scores ============
  async getAggregatedScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(AGGREGATED_SCORE_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getOrganizationScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(AGGREGATED_SCORE_ENDPOINTS.ORGANIZATION, { params });
      return response;
    });
  }

  async getDepartmentScores(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(AGGREGATED_SCORE_ENDPOINTS.DEPARTMENTS, { params });
      return response;
    });
  }

  async getDepartmentRanking(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(AGGREGATED_SCORE_ENDPOINTS.RANKING, { params });
      return response;
    });
  }

  // ============ Traffic Lights ============
  async getTrafficLights(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(TRAFFIC_LIGHT_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getRedAlerts(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(TRAFFIC_LIGHT_ENDPOINTS.RED_ALERTS, { params });
      return response;
    });
  }

  async getMyRedAlerts(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(TRAFFIC_LIGHT_ENDPOINTS.MY_RED_ALERTS, { params });
      return response;
    });
  }
}

export const scoreService = new ScoreService();