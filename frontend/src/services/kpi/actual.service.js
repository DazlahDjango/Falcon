import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class ActualService {
    async getActuals(params = {}) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.LIST, { params });
        return response.data;
    }
    async getActual(id) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.DETAIL(id));
        return response.data;
    }
    async createActual(data, file = null) {
        if (file) {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            formData.append('evidence', file);
            const response = await api.post(API_ENDPOINTS.ACTUAL.CREATE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        }
        const response = await api.post(API_ENDPOINTS.ACTUAL.CREATE, data);
        return response.data;
    }
    async updateActual(id, data) {
        const response = await api.put(API_ENDPOINTS.ACTUAL.UPDATE(id), data);
        return response.data;
    }
    async deleteActual(id) {
        await api.delete(API_ENDPOINTS.ACTUAL.DELETE(id));
    }
    async submitActual(id) {
        const response = await api.post(API_ENDPOINTS.ACTUAL.SUBMIT(id));
        return response.data;
    }
    async approveActual(id, comment = '') {
        const response = await api.post(API_ENDPOINTS.ACTUAL.APPROVE(id), { comment });
        return response.data;
    }
    async rejectActual(id, reasonId, comment = '') {
        const response = await api.post(API_ENDPOINTS.ACTUAL.REJECT(id), {
            reason_id: reasonId,
            comment
        });
        return response.data;
    }
    async resubmitActual(id, value, notes = '') {
        const response = await api.post(API_ENDPOINTS.ACTUAL.RESUBMIT(id), {
            actual_value: value,
            notes
        });
        return response.data;
    }
    async getEvidence(id) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.EVIDENCE(id));
        return response.data;
    }
    async uploadEvidence(actualId, file, description) {
        const formData = new FormData();
        formData.append('actual', actualId);
        formData.append('file', file);
        formData.append('description', description);
        const response = await api.post(API_ENDPOINTS.ACTUAL.EVIDENCE_UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async getValidations(id) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.VALIDATIONS(id));
        return response.data;
    }
    async requestAdjustment(actualId, newValue, reason) {
        const response = await api.post(API_ENDPOINTS.ACTUAL.ADJUSTMENTS, {
            original_actual: actualId,
            adjusted_value: newValue,
            reason
        });
        return response.data;
    }
    async getAdjustmentRequests(params = {}) {
        const response = await api.get(API_ENDPOINTS.ACTUAL.ADJUSTMENTS, { params });
        return response.data;
    }
    async approveAdjustment(id) {
        const response = await api.post(API_ENDPOINTS.ACTUAL.APPROVE_ADJUSTMENT(id));
        return response.data;
    }
    async rejectAdjustment(id) {
        const response = await api.delete(API_ENDPOINTS.ACTUAL.ADJUSTMENT_DETAIL(id));
        return response.data;
    }
    async getActualHistory(kpiId, userId) {
        const response = await api.get(API_ENDPOINTS.HISTORY.FOR_ACTUAL(kpiId), {
            params: { user: userId }
        });
        return response.data;
    }
}
export default new ActualService();