import { BaseKPIService, withRetry } from './kpiBase.service';
import {
  KPI_ENDPOINTS,
  KPI_WEIGHT_ENDPOINTS,
  STRATEGIC_LINKAGE_ENDPOINTS,
  KPI_DEPENDENCY_ENDPOINTS,
  USER_NESTED_ENDPOINTS,
} from '../api/endpoints';

class KPIService extends BaseKPIService {
  constructor() {
    super('kpis');
  }

  // ============ KPI CRUD ============
  async getKPIs(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getKPI(id) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createKPI(data) {
    if (!data) throw new Error('KPI data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateKPI(id, data) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(KPI_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteKPI(id) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(KPI_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async activateKPI(id) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_ENDPOINTS.ACTIVATE(id));
      return response;
    });
  }

  async deactivateKPI(id, reason = '') {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_ENDPOINTS.DEACTIVATE(id), { reason });
      return response;
    });
  }

  async validateKPI(id) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.VALIDATE(id));
      return response;
    });
  }

  async approveKPI(id) {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(`${KPI_ENDPOINTS.DETAIL(id)}approve/`, {});
      return response;
    });
  }

  async rejectKPI(id, reason = '') {
    if (!id) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(`${KPI_ENDPOINTS.DETAIL(id)}reject/`, { reason });
      return response;
    });
  }

  async getPendingKPIApprovals(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(`${KPI_ENDPOINTS.LIST}pending_approvals/`, { params });
      return response;
    });
  }

  async getStaffKPIs(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(`${KPI_ENDPOINTS.LIST}staff_kpis/`, { params });
      return response;
    });
  }

  // ============ KPI Weights ============
  async getKPIWeights(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.WEIGHTS(kpiId), { params });
      return response;
    });
  }

  async updateKPIWeights(kpiId, weights) {
    if (!kpiId) throw new Error('KPI ID is required');
    if (!weights) throw new Error('Weights data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_ENDPOINTS.WEIGHTS(kpiId), { weights });
      return response;
    });
  }

  async getAllWeights(params = {}) {
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_WEIGHT_ENDPOINTS.LIST, { params });
      return response;
    });
  }

  async getWeight(id) {
    if (!id) throw new Error('Weight ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_WEIGHT_ENDPOINTS.DETAIL(id));
      return response;
    });
  }

  async createWeight(data) {
    if (!data) throw new Error('Weight data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_WEIGHT_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateWeight(id, data) {
    if (!id) throw new Error('Weight ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(KPI_WEIGHT_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteWeight(id) {
    if (!id) throw new Error('Weight ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(KPI_WEIGHT_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async validateWeightSum(userId, weights = null) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_WEIGHT_ENDPOINTS.VALIDATE_SUM, {
        user_id: userId,
        weights,
      });
      return response;
    });
  }

  // ============ Strategic Linkages ============
  async getStrategicLinkages(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.STRATEGIC_LINKAGES(kpiId), { params });
      return response;
    });
  }

  async createStrategicLinkage(kpiId, data) {
    if (!kpiId) throw new Error('KPI ID is required');
    if (!data) throw new Error('Linkage data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(STRATEGIC_LINKAGE_ENDPOINTS.CREATE, { ...data, kpi: kpiId });
      return response;
    });
  }

  async updateStrategicLinkage(id, data) {
    if (!id) throw new Error('Linkage ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(STRATEGIC_LINKAGE_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteStrategicLinkage(id) {
    if (!id) throw new Error('Linkage ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(STRATEGIC_LINKAGE_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  // ============ Dependencies ============
  async getDependencies(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.DEPENDENCIES(kpiId), { params });
      return response;
    });
  }

  async createDependency(data) {
    if (!data) throw new Error('Dependency data is required');
    return withRetry(async () => {
      const response = await this.apiClient.post(KPI_DEPENDENCY_ENDPOINTS.CREATE, data);
      return response;
    });
  }

  async updateDependency(id, data) {
    if (!id) throw new Error('Dependency ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.patch(KPI_DEPENDENCY_ENDPOINTS.UPDATE(id), data);
      return response;
    });
  }

  async deleteDependency(id) {
    if (!id) throw new Error('Dependency ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.delete(KPI_DEPENDENCY_ENDPOINTS.DELETE(id));
      return response;
    });
  }

  async getImpactChain(id) {
    if (!id) throw new Error('Dependency ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_DEPENDENCY_ENDPOINTS.IMPACT_CHAIN(id));
      return response;
    });
  }

  // ============ User Nested (My KPIs) ============
  async getUserKPIs(userId, params = {}) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(USER_NESTED_ENDPOINTS.KPI(userId), { params });
      return response;
    });
  }

  async getUserTargets(userId, params = {}) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(USER_NESTED_ENDPOINTS.TARGETS(userId), { params });
      return response;
    });
  }

  async getUserScores(userId, params = {}) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(USER_NESTED_ENDPOINTS.SCORES(userId), { params });
      return response;
    });
  }

  async getUserActuals(userId, params = {}) {
    if (!userId) throw new Error('User ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(USER_NESTED_ENDPOINTS.ACTUALS(userId), { params });
      return response;
    });
  }

  // ============ KPI Targets & Scores (from KPI detail) ============
  async getKPITargets(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.TARGETS(kpiId), { params });
      return response;
    });
  }

  async getKPIScores(kpiId, params = {}) {
    if (!kpiId) throw new Error('KPI ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(KPI_ENDPOINTS.SCORES(kpiId), { params });
      return response;
    });
  }
}

export const kpiService = new KPIService();