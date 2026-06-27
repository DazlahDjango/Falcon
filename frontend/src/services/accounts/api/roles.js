import { request } from './client';
import { ROLE_ENDPOINTS } from '../../../config/constants/accountsApiConstants';

export const getRoles = (params) => request.get(ROLE_ENDPOINTS.LIST, { params });

export const getRole = (id) => request.get(ROLE_ENDPOINTS.DETAIL(id));

export const createRole = (data) => request.post(ROLE_ENDPOINTS.CREATE, data);

export const updateRole = (id, data) => request.patch(ROLE_ENDPOINTS.UPDATE(id), data);

export const deleteRole = (id) => request.delete(ROLE_ENDPOINTS.DELETE(id));

export const getSystemRoles = () => request.get(ROLE_ENDPOINTS.SYSTEM_ROLES);

export const getAssignableRoles = () => request.get(ROLE_ENDPOINTS.ASSIGNABLE_ROLES);

export const getRolePermissions = (id) => request.get(ROLE_ENDPOINTS.ROLE_PERMISSIONS(id));

export const assignPermissions = (id, data) =>
  request.post(ROLE_ENDPOINTS.ASSIGN_PERMISSIONS(id), data);