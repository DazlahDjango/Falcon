import { BillingBaseService } from './BillingBaseService';
import { SYSTEM_ENDPOINTS } from '../../config/constants/billingApiConstants';

class BillingSettingsServiceClass extends BillingBaseService {
    constructor() { super('system-settings'); }

    async getSettings() {
        return this.withRetry(() => this.apiClient.get(''));
    }
    async updateSettings(settings) {
        return this.withRetry(() => this.apiClient.patch('', settings));
    }
    async resetSettings() {
        return this.withRetry(() => this.apiClient.post('', { action: 'reset' }));
    }
}

export const billingSettingsService = new BillingSettingsServiceClass();
export default billingSettingsService;