import { BillingBaseService } from './BillingBaseService';

class BillingPortalServiceClass extends BillingBaseService {
    constructor() { super('portal'); }

    async getPortalAccess(returnUrl = null) {
        return this.withRetry(() => this.apiClient.post('', { return_url: returnUrl }));
    }
    async getPortalOverview() {
        return this.withRetry(() => this.apiClient.get(''));
    }
    async redirectToPortal(returnUrl = null) {
        const response = await this.getPortalAccess(returnUrl);
        const portalUrl = response?.data?.portal_url;
        if (portalUrl) { window.location.href = portalUrl; return true; }
        return false;
    }
    async openPortalInNewTab(returnUrl = null) {
        const response = await this.getPortalAccess(returnUrl);
        const portalUrl = response?.data?.portal_url;
        if (portalUrl) { window.open(portalUrl, '_blank'); return true; }
        return false;
    }
}

export const BillingPortalService = new BillingPortalServiceClass();
export default BillingPortalService;