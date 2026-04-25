import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class ExportService {
    async exportKPIs(format = 'csv', frameworkId = null) {
        const params = { format };
        if (frameworkId) params.framework_id = frameworkId;
        const response = await api.get(API_ENDPOINTS.EXPORT.KPIS, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
    async exportScores(year, month, format = 'csv') {
        const response = await api.get(API_ENDPOINTS.EXPORT.SCORES, {
            params: { year, month, format },
            responseType: 'blob'
        });
        return response.data;
    }
    async exportReport(type = 'pdf', year = null, month = null) {
        const params = { type };
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await api.get(API_ENDPOINTS.EXPORT.REPORTS, {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
    async exportDepartmentReport(departmentId, year, month, format = 'pdf') {
        const response = await api.get('/export/department-report/', {
            params: { department_id: departmentId, year, month, format },
            responseType: 'blob'
        });
        return response.data;
    }
    async exportKPIDetail(kpiId, year, format = 'pdf') {
        const response = await api.get('/export/kpi-detail/', {
            params: { kpi_id: kpiId, year, format },
            responseType: 'blob'
        });
        return response.data;
    }
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
export default new ExportService();