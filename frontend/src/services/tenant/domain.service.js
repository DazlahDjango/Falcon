// frontend/src/services/tenant/domain.service.js
import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class DomainService {
    // ========== Domain CRUD Operations ==========

    async getDomains(tenantId, params = {}) {
        const response = await api.get(API_ENDPOINTS.DOMAIN.LIST, {
            params: { tenant_id: tenantId, ...params }
        });
        return response.data;
    }

    async getDomain(id) {
        const response = await api.get(API_ENDPOINTS.DOMAIN.DETAIL(id));
        return response.data;
    }

    async createDomain(data) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.CREATE, data);
        return response.data;
    }

    async updateDomain(id, data) {
        const response = await api.patch(API_ENDPOINTS.DOMAIN.UPDATE(id), data);
        return response.data;
    }

    async deleteDomain(id) {
        await api.delete(API_ENDPOINTS.DOMAIN.DELETE(id));
    }

    // ========== Domain Verification ==========

    async verifyDomain(id) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.VERIFY(id));
        return response.data;
    }

    async getVerificationInfo(id) {
        const response = await api.get(API_ENDPOINTS.DOMAIN.VERIFICATION_INFO(id));
        return response.data;
    }

    async resendVerification(id) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.RESEND_VERIFICATION(id));
        return response.data;
    }

    // ========== Domain Management ==========

    async setPrimaryDomain(id) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.SET_PRIMARY(id));
        return response.data;
    }

    async getPrimaryDomain(tenantId) {
        const response = await api.get(API_ENDPOINTS.DOMAIN.PRIMARY(tenantId));
        return response.data;
    }

    async updateDomainSSL(id, sslData) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.UPDATE_SSL(id), sslData);
        return response.data;
    }

    // ========== Domain Settings ==========

    async updateDomainSettings(id, settings) {
        const response = await api.patch(API_ENDPOINTS.DOMAIN.SETTINGS(id), settings);
        return response.data;
    }

    async enableForceHTTPS(id) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.FORCE_HTTPS(id));
        return response.data;
    }

    async disableForceHTTPS(id) {
        const response = await api.post(API_ENDPOINTS.DOMAIN.DISABLE_HTTPS(id));
        return response.data;
    }
}

export default new DomainService();