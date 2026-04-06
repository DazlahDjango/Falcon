import { request } from './client';

// Role CRUD
// ============
export const getRoles = (params = {}) => {
    return request.get('/roles/', { params });
};
export const getRoleById = (roleId) => {
    return request.get(`/roles/${roleId}/`);
};
export const createRole = (data) => {
    return request.post('/roles/', data);
};
export const updateRole = (roleId, data) => {
    return request.patch(`/roles/${roleId}/`, data);
};
export const deleteRole = (roleId) => {
    return request.delete(`/roles/${roleId}/`);
};

// Role Actions
// ===============
export const getSystemRoles = () => {
    return request.get('/roles/system/');
};
export const getAssignableRoles = () => {
    return request.get('/roles/assignable/');
};
export const getRolePermissions = (roleId) => {
    return request.get(`/roles/${roleId}/permissions/`);
};
export const assignRolePermissions = (roleId, permissionIds) => {
    return request.post(`/roles/${roleId}/permissions/`, { permission_ids: permissionIds });
};