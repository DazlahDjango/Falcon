// frontend/src/services/tenant/connection.service.js
/**
 * Connection Pool Service
 * Handles database connection monitoring and management
 */

import BaseTenantService from './tenantBase.service';
import { store } from '../../store';
import { showToast } from '../../store/tenant/slice/tenantUISlice';

class ConnectionService extends BaseTenantService {
    constructor() {
        super('connections');
    }

    /**
     * List all connections with filtering
     * @param {Object} params - Filter parameters
     */
    async listConnections(params = {}) {
        return this.list(params);
    }

    /**
     * Get connections for specific tenant
     * @param {string} tenantId - Tenant UUID
     * @param {Object} params - Additional filters
     */
    async getTenantConnections(tenantId, params = {}) {
        return this.listForTenant(tenantId, params);
    }

    /**
     * Get connection details
     * @param {string} connectionId - Connection UUID
     */
    async getConnectionDetails(connectionId) {
        return this.getById(connectionId);
    }

    /**
     * Get connection metrics
     * @param {Object} params - Filter parameters
     */
    async getConnectionMetrics(params = {}) {
        return this.apiClient.get('/connections/metrics/', { params });
    }

    /**
     * Update connection status
     * @param {string} connectionId - Connection UUID
     * @param {Object} statusData - Status update data
     */
    async updateStatus(connectionId, statusData) {
        const response = await this.apiClient.patch(
            `/connections/${connectionId}/update-status/`,
            statusData
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: `Connection status updated to ${statusData.status}`,
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Close connection
     * @param {string} connectionId - Connection UUID
     */
    async closeConnection(connectionId) {
        const response = await this.apiClient.post(
            `/connections/${connectionId}/close/`
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: 'Connection closed successfully',
                type: 'info',
            }));
        }
        
        return response;
    }

    /**
     * Execute manager action
     * @param {Object} actionData - Action configuration
     */
    async managerAction(actionData) {
        const response = await this.apiClient.post(
            '/connections/manager-action/',
            actionData
        );
        
        if (response.success) {
            const { action, details } = response.data;
            store.dispatch(showToast({
                message: details.message || `${action} completed successfully`,
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Close idle connections
     * @param {number} idleMinutes - Minutes of inactivity before closing
     */
    async closeIdleConnections(idleMinutes = 30) {
        const response = await this.apiClient.post(
            '/connections/close-idle/',
            { idle_minutes: idleMinutes }
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: response.data.message,
                type: 'success',
            }));
        }
        
        return response;
    }

    /**
     * Perform health check
     * @param {string} tenantId - Tenant UUID (optional)
     */
    async healthCheck(tenantId = null) {
        const data = tenantId ? { tenant_id: tenantId } : {};
        return this.apiClient.post('/connections/health-check/', data);
    }

    /**
     * Get connection status from manager
     * @param {string} connectionId - Connection UUID
     */
    async getConnectionStatus(connectionId) {
        return this.apiClient.get(`/connections/${connectionId}/status/`);
    }

    /**
     * Get connection statistics
     * @param {Object} params - Filter parameters
     */
    async getConnectionStats(params = {}) {
        return this.apiClient.get('/connections/stats/', { params });
    }

    /**
     * Test connection for tenant
     * @param {string} tenantId - Tenant UUID
     */
    async testConnection(tenantId) {
        const response = await this.apiClient.post(
            `/tenants/${tenantId}/test-connection/`
        );
        
        if (response.success) {
            store.dispatch(showToast({
                message: response.data.is_healthy ? 'Connection test passed' : 'Connection test failed',
                type: response.data.is_healthy ? 'success' : 'error',
            }));
        }
        
        return response;
    }
}

// Export singleton instance
export const connectionService = new ConnectionService();
export default connectionService;