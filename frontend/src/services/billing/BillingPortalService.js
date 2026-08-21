import { BillingBaseService } from './BillingBaseService';
import { PORTAL_ENDPOINTS } from '../../config/constants/billingApiConstants';

class BillingPortalServiceClass extends BillingBaseService {
    constructor() { super('portal'); }

    // POST /portal/ — generates a session URL for the billing portal
    async getPortalAccess(returnUrl = null) {
        return this.withRetry(() => this.apiClient.post(PORTAL_ENDPOINTS.ACCESS, { return_url: returnUrl }));
    }
    // GET /portal/ — returns current subscription overview
    async getPortalOverview() {
        return this.withRetry(() => this.apiClient.get(PORTAL_ENDPOINTS.INFO_GET));
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