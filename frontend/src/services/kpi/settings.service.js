import api from '../api';

const BASE = '/kpis/system-settings';

export const getKpiSystemSettings = () => api.get(`${BASE}/`);

export const updateKpiSystemSettings = (settings) => api.patch(`${BASE}/`, { settings });

export const resetKpiSystemSettings = () => api.post(`${BASE}/reset/`);

export const getPendingValidationSummary = () => api.get('/kpis/validations/pending-summary/');
