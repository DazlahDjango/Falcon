import { request } from './client';
import { PERMISSION_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getPermissions = (params) => request.get(PERMISSION_ENDPOINTS.LIST, { params });

export const getPermission = (id) => request.get(PERMISSION_ENDPOINTS.DETAIL(id));

export const getPermissionsByCategory = (category) =>
  request.get(PERMISSION_ENDPOINTS.BY_CATEGORY(category));

export const getPermissionsByLevel = (level) =>
  request.get(PERMISSION_ENDPOINTS.BY_LEVEL(level));

// ============ ADD MISSING EXPORT ============

export const checkPermission = (permission, resource) =>
  request.get('/permissions/check', { params: { permission, resource } });