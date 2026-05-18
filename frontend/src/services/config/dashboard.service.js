import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class DashboardService extends BaseConfigService {
  constructor() {
    super('dashboard');
  }
  async getOverview() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_OVERVIEW));
  }
  async getBackupDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_BACKUP));
  }
  async getMaintenanceDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_MAINTENANCE));
  }
  async getHealthDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_HEALTH));
  }
  async getDRDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_DR));
  }
  async getSchedulingDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_SCHEDULING));
  }
  async getSecurityDashboard() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_SECURITY));
  }
  async getRecentActivity() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_RECENT));
  }
  async getSystemStatus() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_STATUS));
  }
  async getAllDashboardData() {
    const [overview, backup, maintenance, health, dr, scheduling, security, recent, status] = await Promise.all([
      this.getOverview(), this.getBackupDashboard(), this.getMaintenanceDashboard(),
      this.getHealthDashboard(), this.getDRDashboard(), this.getSchedulingDashboard(),
      this.getSecurityDashboard(), this.getRecentActivity(), this.getSystemStatus()
    ]);
    return { overview, backup, maintenance, health, dr, scheduling, security, recent, status };
  }
}

export const dashboardService = new DashboardService();