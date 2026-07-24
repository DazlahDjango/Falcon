import { BaseReportingService } from './reportingBase.service';
import { DISTRIBUTION_LIST_ENDPOINTS } from '../../config/constants';

class DistributionListService extends BaseReportingService {
  constructor() {
    super('distributions');
  }

  async getDistributionLists(params = {}) {
    const response = await this.client.get(DISTRIBUTION_LIST_ENDPOINTS.LIST, { params });
    return response.data;
  }

  async createDistributionList(data) {
    const response = await this.client.post(DISTRIBUTION_LIST_ENDPOINTS.CREATE, data);
    return response.data;
  }

  async updateDistributionList(id, data) {
    const response = await this.client.put(DISTRIBUTION_LIST_ENDPOINTS.UPDATE(id), data);
    return response.data;
  }

  async deleteDistributionList(id) {
    const response = await this.client.delete(DISTRIBUTION_LIST_ENDPOINTS.DELETE(id));
    return response.data;
  }
}

export const distributionListService = new DistributionListService();
export default distributionListService;
