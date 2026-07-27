import { reportApiClient, withRetry } from '../api';
import { BaseResourceService } from '../api/BaseResourceService';

class ReportBaseService extends BaseResourceService {
    constructor(resourceName) {
        super(resourceName, {
            client: reportApiClient,
            withRetry,
            logLabel: 'Reports'
        });
    }
}

export { reportApiClient, withRetry, ReportBaseService };
export default ReportBaseService;