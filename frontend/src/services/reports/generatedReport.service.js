import { BaseReportingService } from './reportingBase.service';
import { GENERATED_REPORT_ENDPOINTS } from '../../config/constants';

class GeneratedReportService extends BaseReportingService {
  constructor() {
    super('reports');
  }

  async getReports(params = {}) {
    const response = await this.client.get(GENERATED_REPORT_ENDPOINTS.LIST, { params });
    return response.data;
  }

  async getReportDetail(id) {
    const response = await this.client.get(GENERATED_REPORT_ENDPOINTS.DETAIL(id));
    return response.data;
  }

  async generateReport(reportType, format = 'pdf', filters = {}, title = null, asyncMode = true) {
    const response = await this.client.post(GENERATED_REPORT_ENDPOINTS.GENERATE, {
      report_type: reportType,
      format,
      filters,
      title,
      async_mode: asyncMode
    });
    return response.data;
  }

  async downloadReport(id) {
    const response = await this.client.get(GENERATED_REPORT_ENDPOINTS.DOWNLOAD(id), {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteReport(id) {
    const response = await this.client.delete(GENERATED_REPORT_ENDPOINTS.DELETE(id));
    return response.data;
  }
}

export const generatedReportService = new GeneratedReportService();
export default generatedReportService;
