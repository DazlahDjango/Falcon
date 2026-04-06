import { request } from './client';

// KPI CRUD
// ============
export const getKPIs = (params = {}) => {
    return request.get('/kpi/', { params });
};
export const getKPIById = (kpiId) => {
    return request.get(`/kpi/${kpiId}/`);
};
export const getUserKPIs = (params = {}) => {
    return request.get('/kpi/user/', { params });
};
export const createKPI = (data) => {
    return request.post('/kpi/', data);
};
export const updateKPI = (kpiId, data) => {
    return request.patch(`/kpi/${kpiId}/`, data);
};
export const deleteKPI = (kpiId) => {
    return request.delete(`/kpi/${kpiId}/`);
};

// KPI Entries
// ==============
export const getKPIEntries = (kpiId, params = {}) => {
    return request.get(`/kpi/${kpiId}/entries/`, { params });
};
export const createKPIEntry = (kpiId, data) => {
    return request.post(`/kpi/${kpiId}/entries/`, data);
};
export const updateKPIEntry = (kpiId, entryId, data) => {
    return request.patch(`/kpi/${kpiId}/entries/${entryId}/`, data);
};
export const deleteKPIEntry = (kpiId, entryId) => {
    return request.delete(`/kpi/${kpiId}/entries/${entryId}/`);
};

// KPI Validation
// ===================
export const validateKPIEntry = (kpiId, entryId, data) => {
    return request.post(`/kpi/${kpiId}/entries/${entryId}/validate/`, data);
};
export const getPendingValidations = () => {
    return request.get('/kpi/validations/pending/');
};

// KPI Targets & Phasing
// ======================
export const getKPITargets = (kpiId) => {
    return request.get(`/kpi/${kpiId}/targets/`);
};
export const updateKPITargets = (kpiId, data) => {
    return request.patch(`/kpi/${kpiId}/targets/`, data);
};
export const phaseKPITargets = (kpiId, data) => {
    return request.post(`/kpi/${kpiId}/phase-targets/`, data);
};

// KPI Dashboard
// ================
export const getKPIDashboard = (params = {}) => {
    return request.get('/kpi/dashboard/', { params });
};
export const getTeamKPISummary = () => {
    return request.get('/kpi/team-summary/');
};
export const getKPIStats = () => {
    return request.get('/kpi/stats/');
};

// KPI Templates
// ================
export const getKPITemplates = (sector) => {
    return request.get(`/kpi/templates/${sector}/`);
};
export const applyKPITemplate = (templateId, userId) => {
    return request.post(`/kpi/templates/${templateId}/apply/`, { user_id: userId });
};