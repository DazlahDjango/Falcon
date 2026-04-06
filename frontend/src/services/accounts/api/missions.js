import { request } from './client';

// Mission Report CRUD
// ========================
export const getMissionReports = (params = {}) => {
    return request.get('/missions/', { params });
};
export const getMissionReportById = (missionId) => {
    return request.get(`/missions/${missionId}/`);
};
export const getUserMissionReports = (params = {}) => {
    return request.get('/missions/user/', { params });
};
export const createMissionReport = (data) => {
    return request.post('/missions/', data);
};
export const updateMissionReport = (missionId, data) => {
    return request.patch(`/missions/${missionId}/`, data);
};
export const deleteMissionReport = (missionId) => {
    return request.delete(`/missions/${missionId}/`);
};
export const submitMissionReport = (missionId) => {
    return request.post(`/missions/${missionId}/submit/`);
};
export const approveMissionReport = (missionId, data) => {
    return request.post(`/missions/${missionId}/approve/`, data);
};

// Mission Sections
// ====================
export const updateKpiAnalysis = (missionId, kpiId, data) => {
    return request.patch(`/missions/${missionId}/kpi/${kpiId}/`, data);
};
export const updateMissionSummary = (missionId, data) => {
    return request.patch(`/missions/${missionId}/summary/`, data);
};

// Mission Export
// =================
export const exportMissionToPDF = (missionId) => {
    return request.get(`/missions/${missionId}/export/pdf/`, {
        responseType: 'blob'
    });
};
export const exportMissionToWord = (missionId) => {
    return request.get(`/missions/${missionId}/export/docx/`, {
        responseType: 'blob'
    });
};

// Mission Templates
// ==================
export const getMissionTemplates = () => {
    return request.get('/missions/templates/');
};
export const applyMissionTemplate = (missionId, templateId) => {
    return request.post(`/missions/${missionId}/apply-template/`, { template_id: templateId });
};