import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class ValidationService {
    async getValidations(params = {}) {
        const response = await api.get(API_ENDPOINTS.VALIDATION.LIST, { params });
        return response.data;
    }
    async getPendingValidations(supervisorId) {
        const response = await api.get(API_ENDPOINTS.VALIDATION.PENDING, {
            params: { supervisor: supervisorId }
        });
        return response.data;
    }
    async approveValidation(id, comment = '') {
        const response = await api.post(API_ENDPOINTS.ACTUAL.APPROVE(id), { comment });
        return response.data;
    }
    async rejectValidation(id, reasonId, comment = '') {
        const response = await api.post(API_ENDPOINTS.ACTUAL.REJECT(id), {
            reason_id: reasonId,
            comment
        });
        return response.data;
    }
    async getRejectionReasons() {
        const response = await api.get(API_ENDPOINTS.VALIDATION.REJECTION_REASONS);
        return response.data;
    }
    async createEscalation(actualId, escalatedToId, reason) {
        const response  = await api.post(API_ENDPOINTS.VALIDATION.ESCALATIONS, {
            actual: actualId,
            escalated_to: escalatedToId,
            reason
        });
        return response.data;
    }
    async getEscalations(params = {}) {
        const response = await api.get(API_ENDPOINTS.VALIDATION.ESCALATIONS, { params });
        return response.data;
    }
    async getMyEscalations() {
        const response = await api.get(API_ENDPOINTS.VALIDATION.MY_ESCALATIONS);
        return response.data;
    }
    async resolveEscalation(id, resolution) {
        const response = await api.post(API_ENDPOINTS.VALIDATION.RESOLVE_ESCALATION(id), {
            resolution
        });
        return response.data;
    }
    async getValidationHistory(actualId) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.VALIDATIONS(actualId));
        return response.data;
    }
    async batchApprove(actualIds, comment = '') {
        const response = await api.post('/validations/batch-approve/', {
            actual_ids: actualIds,
            comment
        });
        return response.data;
    }
    async batchReject(actualIds, reasonId, comment = '') {
        const response = await api.post('/validations/batch-reject/', {
            actual_ids: actualIds,
            reason_id: reasonId,
            comment
        });
        return response.data;
    }
}
export default new ValidationService();