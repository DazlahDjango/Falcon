import { BaseBillingService, withRetry } from './client';

class CustomerPortalService extends BaseBillingService {
    constructor() {
        super('portal');
    }
    async createPortalSession(returnUrl = null) {
        const data = returnUrl ? { return_url: returnUrl } : {};
        return withRetry(() => this.apiClient.post(this.getEndpoint(), data));
    }
    redirectToPortal(portalUrl) {
        if (!portalUrl) {
            throw new Error('Portal URL is required');
        }
        window.location.href = portalUrl;
    }
    openPortalInNewTab(portalUrl) {
        if (!portalUrl) {
            throw new Error('Portal URL is required');
        }
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
    }
}
export const customerPortalService = new CustomerPortalService();
export default customerPortalService;