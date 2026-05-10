import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class FrameworkService {
    async getSectors() {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.SECTORS);
        return response.data;
    }
    async getFrameworks(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.FRAMEWORKS, { params });
        return response.data;
    }
    async getCategories(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.CATEGORIES, { params });
        return response.data;
    }
    async getTemplates(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.TEMPLATES, { params });
        return response.data;
    }
}
export default new FrameworkService();
