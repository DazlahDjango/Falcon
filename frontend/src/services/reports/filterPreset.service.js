import { BaseReportingService } from './reportingBase.service';
import { REPORT_FILTER_ENDPOINTS, REPORT_PRESET_ENDPOINTS } from '../../config/constants';

class ReportFilterPresetService extends BaseReportingService {
  constructor() {
    super('filters');
  }

  async getFilters(params = {}) {
    const response = await this.client.get(REPORT_FILTER_ENDPOINTS.LIST, { params });
    return response.data;
  }

  async createFilter(data) {
    const response = await this.client.post(REPORT_FILTER_ENDPOINTS.CREATE, data);
    return response.data;
  }

  async deleteFilter(id) {
    const response = await this.client.delete(REPORT_FILTER_ENDPOINTS.DELETE(id));
    return response.data;
  }

  async getPresets(params = {}) {
    const response = await this.client.get(REPORT_PRESET_ENDPOINTS.LIST, { params });
    return response.data;
  }

  async createPreset(data) {
    const response = await this.client.post(REPORT_PRESET_ENDPOINTS.CREATE, data);
    return response.data;
  }

  async deletePreset(id) {
    const response = await this.client.delete(REPORT_PRESET_ENDPOINTS.DELETE(id));
    return response.data;
  }
}

export const reportFilterPresetService = new ReportFilterPresetService();
export default reportFilterPresetService;
