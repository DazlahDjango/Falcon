import { kpiApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseKPIService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, { 
      client: kpiApiClient, 
      withRetry, 
      logLabel: 'KPI' 
    });
  }
}

export { kpiApiClient as apiClient, withRetry, BaseKPIService };
export default BaseKPIService;