import { reportApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseReportingService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, {
      client: reportApiClient,
      withRetry,
      logLabel: 'Reporting'
    });
  }
}

export { reportApiClient as apiClient, withRetry, BaseReportingService };
export default BaseReportingService;
