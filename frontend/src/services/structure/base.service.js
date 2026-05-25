import { structureApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class BaseStructureService extends BaseResourceService {
  constructor(resourceName) {
    super(resourceName, { client: structureApiClient, withRetry, logLabel: 'Structure' });
  }
}

export { structureApiClient as apiClient, withRetry, BaseStructureService };
export default BaseStructureService;