import { BaseConfigService } from './configBase.service';
import { CONFIG_API } from '../../config/constants/configApiConstants';

class QuotaService extends BaseConfigService {
  constructor() {
    super('quotas');
  }
  async getQuotas(params = {}) {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.QUOTAS, { params }));
  }
  async getQuota(quotaId) {
    return this.withRetry(() => this.apiClient.get(`${CONFIG_API.QUOTAS}/${quotaId}/`));
  }
  async updateQuota(quotaId, data) {
    return this.withRetry(() => this.apiClient.put(CONFIG_API.UPDATE_QUOTA(quotaId), data));
  }
  async getOverThreshold() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.OVER_THRESHOLD));
  }
  async getExceededQuotas() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.EXCEEDED_QUOTAS));
  }
  async getQuotaStats() {
    return this.withRetry(() => this.apiClient.get(CONFIG_API.DASHBOARD_OVERVIEW));
  }
}

export const quotaService = new QuotaService();