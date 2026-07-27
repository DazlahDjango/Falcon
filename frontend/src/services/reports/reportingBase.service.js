import { reportingApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseReportingService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, {
      client: reportingApiClient,
      withRetry,
      logLabel: 'Reporting'
    });
  }
}

export { reportingApiClient as apiClient, withRetry, BaseReportingService };
export default BaseReportingService;
