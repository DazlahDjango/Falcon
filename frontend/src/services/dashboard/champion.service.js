// frontend/src/services/dashboard/champion.service.js

import { BaseDashboardService } from './dashboard.service';
import { DASHBOARD_API } from '../../config/constants/dashboardApiConstants';

class ChampionService extends BaseDashboardService {
  constructor() {
    super('champion');
  }

  /**
   * Get editable dashboard data for a user
   * @param {string} userId - Target user ID (optional, defaults to current)
   * @param {string} period - Period
   */
  async getEditableDashboard(userId = null, period = 'current') {
    let url = DASHBOARD_API.CHAMPION.BASE;
    if (userId) {
      url = DASHBOARD_API.CHAMPION.EDITABLE_DASHBOARD(userId);
    }
    return this.apiClient.get(`${url}?period=${period}`);
  }

  /**
   * Update dashboard configuration
   * @param {Object} config - Configuration object
   * @param {string} config.userId - Target user ID
   * @param {Object} config.config - Configuration changes
   */
  async updateDashboardConfig(config) {
    return this.apiClient.put(DASHBOARD_API.CHAMPION.UPDATE_CONFIG, {
      user_id: config.userId,
      config: config.config
    });
  }

  /**
   * Get available KPIs for assignment
   * @param {string} userId - Target user ID
   */
  async getAvailableKPIs(userId) {
    const url = DASHBOARD_API.CHAMPION.AVAILABLE_KPIS(userId);
    return this.apiClient.get(url);
  }

  /**
   * Get assigned KPIs for a user
   * @param {string} userId - Target user ID
   */
  async getAssignedKPIs(userId) {
    const url = DASHBOARD_API.CHAMPION.ASSIGNED_KPIS(userId);
    return this.apiClient.get(url);
  }

  /**
   * Add KPI to user's dashboard
   * @param {Object} data - Assignment data
   * @param {string} data.userId - Target user ID
   * @param {string} data.kpiId - KPI ID
   * @param {number} data.weight - KPI weight
   */
  async addKPI(data) {
    return this.updateDashboardConfig({
      userId: data.userId,
      config: {
        kpi_assignments: [{ kpi_id: data.kpiId, action: 'add', weight: data.weight || 1 }]
      }
    });
  }

  /**
   * Remove KPI from user's dashboard
   * @param {Object} data - Removal data
   * @param {string} data.userId - Target user ID
   * @param {string} data.kpiId - KPI ID
   */
  async removeKPI(data) {
    return this.updateDashboardConfig({
      userId: data.userId,
      config: {
        kpi_assignments: [{ kpi_id: data.kpiId, action: 'remove' }]
      }
    });
  }

  /**
   * Update KPI weight for a user
   * @param {Object} data - Weight data
   * @param {string} data.userId - Target user ID
   * @param {Object} data.weights - Map of KPI IDs to weights
   */
  async updateKPIWeights(data) {
    return this.updateDashboardConfig({
      userId: data.userId,
      config: { weights: data.weights }
    });
  }

  /**
   * Update KPI targets for a user
   * @param {Object} data - Target data
   * @param {string} data.userId - Target user ID
   * @param {Object} data.targets - Map of KPI IDs to targets
   * @param {string} data.period - Period
   */
  async updateKPITargets(data) {
    return this.updateDashboardConfig({
      userId: data.userId,
      config: { targets: data.targets, period: data.period || 'current' }
    });
  }

  /**
   * Get all champion templates
   */
  async getTemplates() {
    return this.apiClient.get(DASHBOARD_API.CHAMPION.TEMPLATES);
  }

  /**
   * Get a specific template
   * @param {string} templateId - Template ID
   */
  async getTemplate(templateId) {
    const url = `${DASHBOARD_API.CHAMPION.TEMPLATES}/${templateId}`;
    return this.apiClient.get(url);
  }

  /**
   * Create a new template from configuration
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {string} data.description - Template description
   * @param {string} data.category - Template category
   * @param {Object} data.configuration - Dashboard configuration
   */
  async createTemplate(data) {
    return this.apiClient.post(DASHBOARD_API.CHAMPION.TEMPLATES, {
      name: data.name,
      description: data.description,
      category: data.category,
      saved_configuration: data.configuration
    });
  }

  /**
   * Apply a template to a user
   * @param {string} templateId - Template ID
   * @param {string} userId - Target user ID
   */
  async applyTemplate(templateId, userId) {
    const url = DASHBOARD_API.CHAMPION.APPLY_TEMPLATE(templateId);
    return this.apiClient.post(url, { user_id: userId });
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    return this.apiClient.post(DASHBOARD_API.CHAMPION.REFRESH);
  }
}

export default new ChampionService();