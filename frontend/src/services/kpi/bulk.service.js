import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class BulkService {
    async uploadKPIs(file, frameworkId, dryRun = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('framework_id', frameworkId);
        if (dryRun) formData.append('dry_run', 'true');
        const response = await api.post(API_ENDPOINTS.BULK.KPI_UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async uploadActuals(file, year, month, dryRun = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('year', year);
        formData.append('month', month);
        if (dryRun) formData.append('dry_run', 'true');
        
        const response = await api.post(API_ENDPOINTS.BULK.ACTUAL_UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async uploadTargets(file, year, dryRun = false) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('year', year);
        if (dryRun) formData.append('dry_run', 'true');
        const response = await api.post(API_ENDPOINTS.BULK.TARGET_UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async downloadTemplate(type) {
        const response = await api.get(`/bulk/templates/${type}/`, {
            responseType: 'blob'
        });
        return response.data;
    }
    async validateUpload(file, type) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const response = await api.post('/bulk/validate/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
}
export default new BulkService();