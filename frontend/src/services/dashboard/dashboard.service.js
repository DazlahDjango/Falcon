/**
 * Dashboard app base service — uses shared API client from services/api.
 */
import { dashboardApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseDashboardService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, { client: dashboardApiClient, withRetry, logLabel: 'Dashboard' });
  }
}

export { dashboardApiClient as apiClient, withRetry, BaseDashboardService };
