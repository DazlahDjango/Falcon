import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class KPIService {
    async getKPIs(params = {}) {
        const response = await api.get(API_ENDPOINTS.KPI.LIST, { params });
        return response.data;
    }
    async getKPI(id) {
        const response = await api.get(API_ENDPOINTS.KPI.DETAIL(id));
        return response.data;
    }
    async createKPI(data) {
        const response = await api.post(API_ENDPOINTS.KPI.CREATE, data);
        return response.data;
    }
    async updateKPI(id, data) {
        const response = await api.put(API_ENDPOINTS.KPI.UPDATE(id), data);
        return response.data;
    }
    async deleteKPI(id) {
        await api.delete(API_ENDPOINTS.KPI.DELETE(id));
    }
    async activateKPI(id) {
        const response = await api.post(API_ENDPOINTS.KPI.ACTIVATE(id));
        return response.data;
    }
    async deactivateKPI(id, reason) {
        const response = await api.post(API_ENDPOINTS.KPI.DEACTIVATE(id), { reason });
        return response.data;
    }
    async getKPIWeights(kpiId, params = {}) {
        const response = await api.get(API_ENDPOINTS.KPI.WEIGHTS(kpiId), { params });
        return response.data;
    }
    async updateKPIWeights(kpiId, weights) {
        const response = await api.post(API_ENDPOINTS.KPI.WEIGHTS(kpiId), { weights });
        return response.data;
    }
    async getStrategicLinkages(kpiId) {
        const response = await api.get(API_ENDPOINTS.KPI.STRATEGIC_LINKAGES(kpiId));
        return response.data;
    }
    async createStrategicLinkage(data) {
        const response = await api.post(API_ENDPOINTS.LINKAGE.LIST, data);
        return response.data;
    }
    async getDependencies(kpiId) {
        const response = await api.get(API_ENDPOINTS.KPI.DEPENDENCIES(kpiId));
        return response.data;
    }
    async createDependency(data) {
        const response = await api.post(API_ENDPOINTS.DEPENDENCY.LIST, data);
        return response.data;
    }
    async validateKPI(id) {
        const response = await api.get(API_ENDPOINTS.KPI.VALIDATE(id));
        return response.data;
    }
    async exportKPIs(frameworkId) {
        const response = await api.get(API_ENDPOINTS.EXPORT.KPIS, {
            params: { framework_id: frameworkId },
            responseType: 'blob'
        });
        return response.data;
    }
}
export default new KPIService();