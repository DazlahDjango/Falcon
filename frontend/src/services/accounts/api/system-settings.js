import { request } from './client';
import { SYSTEM_SETTINGS_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getSystemSettings = () => request.get(SYSTEM_SETTINGS_ENDPOINTS.GET);

export const updateSystemSettings = (data) => request.patch(SYSTEM_SETTINGS_ENDPOINTS.UPDATE, data);

export const resetSystemSettings = () => request.post(SYSTEM_SETTINGS_ENDPOINTS.RESET);

export const syncPolicy = () => request.post(SYSTEM_SETTINGS_ENDPOINTS.SYNC_POLICY);