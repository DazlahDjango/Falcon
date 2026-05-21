import api from '../api';

const BASE = '/billing/system-settings';

export const getBillingSystemSettings = () => api.get(`${BASE}/`);

export const updateBillingSystemSettings = (settings) => api.patch(`${BASE}/`, { settings });

export const resetBillingSystemSettings = () => api.post(`${BASE}/reset/`);
