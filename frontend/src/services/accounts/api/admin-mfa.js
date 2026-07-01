import { request } from './client';
import { ADMIN_MFA_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const resetUserMFA = (userId, data) =>
  request.post(ADMIN_MFA_ENDPOINTS.RESET(userId), data);

export const clearUserDevices = (userId) =>
  request.delete(ADMIN_MFA_ENDPOINTS.CLEAR_DEVICES(userId));

export const clearUserDevice = (userId, deviceId) =>
  request.delete(ADMIN_MFA_ENDPOINTS.CLEAR_DEVICE(userId, deviceId));

export const getAdminMFAStatus = (userId) => request.get(ADMIN_MFA_ENDPOINTS.STATUS(userId));