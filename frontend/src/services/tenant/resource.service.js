// frontend/src/services/tenant/resource.service.js
import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class ResourceService {
    // ========== Resource CRUD Operations ==========

    async getResources(tenantId) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.LIST, {
            params: { tenant_id: tenantId }
        });
        return response.data;
    }

    async getResource(id) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.DETAIL(id));
        return response.data;
    }

    async updateResource(id, data) {
        const response = await api.patch(API_ENDPOINTS.RESOURCE.UPDATE(id), data);
        return response.data;
    }

    // ========== Bulk Resource Operations ==========

    async bulkUpdateResources(tenantId, resources) {
        const response = await api.post(API_ENDPOINTS.RESOURCE.BULK_UPDATE, {
            tenant_id: tenantId,
            resources
        });
        return response.data;
    }

    async resetResource(tenantId, resourceType) {
        const response = await api.post(API_ENDPOINTS.RESOURCE.RESET(tenantId), { resourceType });
        return response.data;
    }

    async resetAllDailyResources() {
        const response = await api.post(API_ENDPOINTS.RESOURCE.RESET_ALL);
        return response.data;
    }

    // ========== Resource Monitoring ==========

    async getResourceSummary(tenantId) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.SUMMARY(tenantId));
        return response.data;
    }

    async getResourceHistory(tenantId, resourceType, params = {}) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.HISTORY(tenantId, resourceType), { params });
        return response.data;
    }

    async checkQuota(tenantId, resourceType, amount = 1) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.CHECK_QUOTA(tenantId), {
            params: { resource_type: resourceType, amount }
        });
        return response.data;
    }

    // ========== Resource Alerts ==========

    async getResourceAlerts(tenantId) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.ALERTS(tenantId));
        return response.data;
    }

    async acknowledgeAlert(alertId) {
        const response = await api.post(API_ENDPOINTS.RESOURCE.ACKNOWLEDGE_ALERT(alertId));
        return response.data;
    }

    // ========== Resource Analytics ==========

    async getResourceAnalytics(tenantId, params = {}) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.ANALYTICS(tenantId), { params });
        return response.data;
    }

    async getResourceForecast(tenantId, resourceType) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.FORECAST(tenantId, resourceType));
        return response.data;
    }

    // ========== Recommendation ==========

    async getUpgradeRecommendations(tenantId) {
        const response = await api.get(API_ENDPOINTS.RESOURCE.RECOMMENDATIONS(tenantId));
        return response.data;
    }
}

export default new ResourceService();