// frontend/src/services/kpi/framework.service.js
import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class FrameworkService {
    // ============ SECTORS ============

    async getSectors(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.SECTORS, { params });
        return response.data;
    }

    async getSector(id) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.SECTOR_DETAIL(id));
        return response.data;
    }

    async createSector(data) {
        const response = await api.post(API_ENDPOINTS.FRAMEWORK.SECTORS, data);
        return response.data;
    }

    async updateSector(id, data) {
        const response = await api.put(API_ENDPOINTS.FRAMEWORK.SECTOR_DETAIL(id), data);
        return response.data;
    }

    async deleteSector(id) {
        await api.delete(API_ENDPOINTS.FRAMEWORK.SECTOR_DETAIL(id));
    }

    async getSectorFrameworks(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.SECTOR_DETAIL(id)}/frameworks/`, { params });
        return response.data;
    }

    async getSectorTemplates(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.SECTOR_DETAIL(id)}/templates/`, { params });
        return response.data;
    }

    // ============ FRAMEWORKS ============

    async getFrameworks(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.FRAMEWORKS, { params });
        return response.data;
    }

    async getFramework(id) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id));
        return response.data;
    }

    async createFramework(data) {
        const response = await api.post(API_ENDPOINTS.FRAMEWORK.FRAMEWORKS, data);
        return response.data;
    }

    async updateFramework(id, data) {
        const response = await api.put(API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id), data);
        return response.data;
    }

    async deleteFramework(id) {
        await api.delete(API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id));
    }

    async publishFramework(id) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id)}/publish/`);
        return response.data;
    }

    async archiveFramework(id) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id)}/archive/`);
        return response.data;
    }

    async duplicateFramework(id) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id)}/duplicate/`);
        return response.data;
    }

    async getFrameworkCategories(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id)}/categories/`, { params });
        return response.data;
    }

    async getFrameworkKPIs(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.FRAMEWORK_DETAIL(id)}/kpis/`, { params });
        return response.data;
    }

    // ============ CATEGORIES ============

    async getCategories(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.CATEGORIES, { params });
        return response.data;
    }

    async getCategory(id) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id));
        return response.data;
    }

    async createCategory(data) {
        const response = await api.post(API_ENDPOINTS.FRAMEWORK.CATEGORIES, data);
        return response.data;
    }

    async updateCategory(id, data) {
        const response = await api.put(API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id), data);
        return response.data;
    }

    async deleteCategory(id) {
        await api.delete(API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id));
    }

    async moveCategory(id, parentId) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id)}/move/`, { parent_id: parentId });
        return response.data;
    }

    async reorderCategories(categories) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.CATEGORIES}reorder/`, { categories });
        return response.data;
    }

    async getCategoryChildren(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id)}/children/`, { params });
        return response.data;
    }

    async getCategoryKPIs(id, params = {}) {
        const response = await api.get(`${API_ENDPOINTS.FRAMEWORK.CATEGORY_DETAIL(id)}/kpis/`, { params });
        return response.data;
    }

    // ============ TEMPLATES ============

    async getTemplates(params = {}) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.TEMPLATES, { params });
        return response.data;
    }

    async getTemplate(id) {
        const response = await api.get(API_ENDPOINTS.FRAMEWORK.TEMPLATE_DETAIL(id));
        return response.data;
    }

    async createTemplate(data) {
        const response = await api.post(API_ENDPOINTS.FRAMEWORK.TEMPLATES, data);
        return response.data;
    }

    async updateTemplate(id, data) {
        const response = await api.put(API_ENDPOINTS.FRAMEWORK.TEMPLATE_DETAIL(id), data);
        return response.data;
    }

    async deleteTemplate(id) {
        await api.delete(API_ENDPOINTS.FRAMEWORK.TEMPLATE_DETAIL(id));
    }

    async publishTemplate(id) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.TEMPLATE_DETAIL(id)}/publish/`);
        return response.data;
    }

    async useTemplate(id, frameworkId) {
        const response = await api.post(`${API_ENDPOINTS.FRAMEWORK.TEMPLATE_DETAIL(id)}/use_template/`, { framework_id: frameworkId });
        return response.data;
    }

    // ============ ADMIN OVERVIEW ============

    async getAdminOverview() {
        const response = await api.get('/kpis/admin/overview/');
        return response.data;
    }
}

export default new FrameworkService();