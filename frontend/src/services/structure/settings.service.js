import api from '../api';

const BASE = '/structure/system-settings';

export const getStructureSystemSettings = () => api.get(`${BASE}/`);

export const updateStructureSystemSettings = (settings) => api.patch(`${BASE}/`, { settings });

export const resetStructureSystemSettings = () => api.post(`${BASE}/reset/`);

export const getStructureReferenceData = (include = 'counts,departments') => api.get(
    '/structure/reference-data/',
    { params: { include } },
);
