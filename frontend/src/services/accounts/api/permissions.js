import { request } from './client';

// Permission CRUD
// ===================
export const getPermissions = (params = {}) => {
    return request.get('/permissions/', { params });
};
export const getPermissionById = (permissionId) => {
    return request.get(`/permissions/${permissionId}/`);
};
export const getPermissionsByCategory = (category) => {
    return request.get(`/permissions/by-category/${category}/`);
};
export const getPermissionsByLevel = (level) => {
    return request.get(`/permissions/by-level/${level}/`);
};
export const checkPermission = (permission, objectId = null) => {
    const params = objectId ? { permission, object_id: objectId } : { permission };
    return request.get('/permissions/check/', { params });
};
export const getUserPermissions = () => {
    return request.get('/permissions/user/');
};
export const getUserPermissionsSummary = (userId = null) => {
    const url = userId ? `/permissions/user/${userId}/` : '/permissions/user/me/';
    return request.get(url);
};