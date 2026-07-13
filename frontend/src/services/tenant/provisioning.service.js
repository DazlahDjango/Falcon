// frontend/src/services/tenant/provisioning.service.js
import { BaseTenantService } from './tenantBase.service';
import { PROVISIONING_ENDPOINTS } from '../../config/constants/tenantApiConstants';

class ProvisioningService extends BaseTenantService {
    constructor() {
        super('provisioning');
    }

    // ==================== Monitoring / List ====================

    /**
     * List all organizations with their provisioning state summary.
     * @param {Object} params - Optional query params (status, ordering)
     * @returns {Promise}
     */
    async listAll(params = {}) {
        return this.withRetry(() =>
            this.apiClient.get(PROVISIONING_ENDPOINTS.LIST, { params })
        );
    }

    /**
     * List organizations that FAILED provisioning.
     * @returns {Promise}
     */
    async listFailed() {
        return this.withRetry(() =>
            this.apiClient.get(PROVISIONING_ENDPOINTS.FAILED)
        );
    }

    /**
     * List organizations currently in PROVISIONING state.
     * @returns {Promise}
     */
    async listInProgress() {
        return this.withRetry(() =>
            this.apiClient.get(PROVISIONING_ENDPOINTS.IN_PROGRESS)
        );
    }

    // ==================== Per-Organization Status ====================

    /**
     * Get the full step-level provisioning status for a single organization.
     * @param {string|number} orgId - Organization ID
     * @returns {Promise}
     */
    async getStatus(orgId) {
        if (!orgId) throw new Error('Organization ID is required');
        return this.withRetry(() =>
            this.apiClient.get(PROVISIONING_ENDPOINTS.STATUS(orgId))
        );
    }

    // ==================== Provisioning Actions ====================

    /**
     * Manually trigger provisioning for a PENDING (or any, if force=true) org.
     * @param {string|number} orgId - Organization ID
     * @param {boolean} force - Override status guard (super-admin emergency use)
     * @returns {Promise}
     */
    async trigger(orgId, force = false) {
        if (!orgId) throw new Error('Organization ID is required');
        return this.withRetry(() =>
            this.apiClient.post(PROVISIONING_ENDPOINTS.TRIGGER(orgId), { force })
        );
    }

    /**
     * Retry provisioning for a FAILED organization.
     * Resets to PENDING and re-runs the pipeline (idempotent — skips completed steps).
     * @param {string|number} orgId - Organization ID
     * @param {boolean} force - Override status guard
     * @returns {Promise}
     */
    async retry(orgId, force = false) {
        if (!orgId) throw new Error('Organization ID is required');
        return this.withRetry(() =>
            this.apiClient.post(PROVISIONING_ENDPOINTS.RETRY(orgId), { force })
        );
    }

    /**
     * Force rollback — drops the PostgreSQL schema and marks org as FAILED.
     * DESTRUCTIVE: use with extreme caution.
     * @param {string|number} orgId - Organization ID
     * @returns {Promise}
     */
    async rollback(orgId) {
        if (!orgId) throw new Error('Organization ID is required');
        return this.withRetry(() =>
            this.apiClient.post(PROVISIONING_ENDPOINTS.ROLLBACK(orgId))
        );
    }
}

export const provisioningService = new ProvisioningService();
export default provisioningService;