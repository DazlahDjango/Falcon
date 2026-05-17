/**
 * Billing Portal Service
 * Handles customer billing portal operations
 */

import { BillingBaseService } from './BillingBaseService';
import { BILLING_PORTAL_ENDPOINTS } from '../../config/constants/billingApiConstants';

class BillingPortalServiceClass extends BillingBaseService {
    constructor() {
        super('portal');
    }

    /**
     * Get billing portal access URL
     * @param {string} returnUrl - URL to return after portal session
     */
    async getPortalAccess(returnUrl = null) {
        return this.withRetry(() => 
            this.apiClient.post(BILLING_PORTAL_ENDPOINTS.ACCESS, { return_url: returnUrl })
        );
    }

    /**
     * Get billing portal overview data
     */
async getPortalOverview() {
        return this.withRetry(() => 
            this.apiClient.get(BILLING_PORTAL_ENDPOINTS.OVERVIEW)
        );
    }
    
    async getBillingSettings() {
        return this.withRetry(() => 
            this.apiClient.get(BILLING_PORTAL_ENDPOINTS.SETTINGS)
        );
    }
    
    async updateBillingSettings(settings) {
        return this.withRetry(() => 
            this.apiClient.patch(BILLING_PORTAL_ENDPOINTS.SETTINGS, settings)
        );
    }

    /**
     * Get billing settings
     */
    async getBillingSettings() {
        return this.withRetry(() => 
            this.apiClient.get(BILLING_PORTAL_ENDPOINTS.SETTINGS)
        );
    }

    /**
     * Update billing settings
     * @param {Object} settings - Settings to update
     */
    async updateBillingSettings(settings) {
        return this.withRetry(() => 
            this.apiClient.put(BILLING_PORTAL_ENDPOINTS.SETTINGS, settings)
        );
    }

    /**
     * Redirect to billing portal
     * @param {string} returnUrl - URL to return after portal
     */
    async redirectToPortal(returnUrl = null) {
        const response = await this.getPortalAccess(returnUrl);
        const portalUrl = response?.data?.portal_url;
        
        if (portalUrl) {
            window.location.href = portalUrl;
            return true;
        }
        return false;
    }

    /**
     * Open billing portal in new tab
     * @param {string} returnUrl - URL to return after portal
     */
    async openPortalInNewTab(returnUrl = null) {
        const response = await this.getPortalAccess(returnUrl);
        const portalUrl = response?.data?.portal_url;
        
        if (portalUrl) {
            window.open(portalUrl, '_blank');
            return true;
        }
        return false;
    }
}

export const BillingPortalService = new BillingPortalServiceClass();
export default BillingPortalService;