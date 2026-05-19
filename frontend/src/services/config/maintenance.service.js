import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class MaintenanceService extends BaseConfigService {
  constructor() {
    super('maintenance-windows');
  }
  async scheduleMaintenance(title, maintenanceType, scheduledStart, scheduledEnd, reason, affectedAppIds = []) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.MAINTENANCE_WINDOWS, {
      title, maintenance_type: maintenanceType, scheduled_start: scheduledStart, scheduled_end: scheduledEnd, reason, affected_apps: affectedAppIds
    }));
  }
  async startMaintenance(windowId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.START_MAINTENANCE(windowId)));
  }
  async stopMaintenance(windowId) {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.STOP_MAINTENANCE(windowId)));
  }
  async cancelMaintenance(windowId) {
    return this.withRetry(() => this.apiClient.delete(CONFIG_API.CANCEL_MAINTENANCE(windowId)));
  }
  async getLogs(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.MAINTENANCE_LOGS, { params }));
  }
  async runRiskAssessment() {
    return this.withRetry(() => this.apiClient.post(CONFIG_API.RISK_ASSESSMENT));
  }
  async getMaintenanceStats(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_MAINTENANCE, { params }));
  }
}

export const maintenanceService = new MaintenanceService();