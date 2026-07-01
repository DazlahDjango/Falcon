import { request } from './client';
import {
  USER_PREFERENCE_ENDPOINTS,
  TENANT_PREFERENCE_ENDPOINTS,
} from '../../../config/constants/accountsApiConstants';

export const getUserPreferences = (params) =>
  request.get(USER_PREFERENCE_ENDPOINTS.LIST, { params });

export const getUserPreference = (id) => request.get(USER_PREFERENCE_ENDPOINTS.DETAIL(id));

export const updateUserPreference = (id, data) =>
  request.patch(USER_PREFERENCE_ENDPOINTS.UPDATE(id), data);

export const getMyPreferences = () => request.get(USER_PREFERENCE_ENDPOINTS.MY_PREFERENCES);

export const updateMyPreferences = (data) =>
  request.patch(USER_PREFERENCE_ENDPOINTS.MY_PREFERENCES, data);

export const updateNotificationSettings = (data) =>
  request.post(USER_PREFERENCE_ENDPOINTS.UPDATE_NOTIFICATIONS, data);

export const getTenantPreferences = (params) =>
  request.get(TENANT_PREFERENCE_ENDPOINTS.LIST, { params });

export const getTenantPreference = (id) => request.get(TENANT_PREFERENCE_ENDPOINTS.DETAIL(id));

export const updateTenantPreference = (id, data) =>
  request.patch(TENANT_PREFERENCE_ENDPOINTS.UPDATE(id), data);

export const getMyTenantPreferences = () =>
  request.get(TENANT_PREFERENCE_ENDPOINTS.MY_TENANT_PREFERENCES);

export const updateMyTenantPreferences = (data) =>
  request.patch(TENANT_PREFERENCE_ENDPOINTS.MY_TENANT_PREFERENCES, data);

export const updateBranding = (data) =>
  request.patch(TENANT_PREFERENCE_ENDPOINTS.UPDATE_BRANDING, data);