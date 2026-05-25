/**
 * Config app base service — uses shared API client from services/api.
 */
import { configApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseConfigService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, { client: configApiClient, withRetry, logLabel: 'Config' });
  }
}

export { configApiClient as apiClient, withRetry, BaseConfigService };