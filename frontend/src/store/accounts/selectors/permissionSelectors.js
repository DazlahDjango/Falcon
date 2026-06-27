export const selectPermissionsState = (state) => state.permissions || {};

export const selectPermissions = (state) => state.permissions?.permissions || [];

export const selectSelectedPermission = (state) => state.permissions?.selectedPermission || null;

export const selectPermissionsByCategory = (state, category) => {
  const byCategory = state.permissions?.permissionsByCategory || {};
  return byCategory[category] || [];
};

export const selectPermissionsByLevel = (state, level) => {
  const byLevel = state.permissions?.permissionsByLevel || {};
  return byLevel[level] || [];
};

export const selectPermissionsLoading = (state) => state.permissions?.isLoading || false;

export const selectPermissionsError = (state) => state.permissions?.error || null;

export const selectPermissionsPagination = (state) => state.permissions?.pagination || { page: 1, pageSize: 20, total: 0 };

export const selectPermissionsFilters = (state) => state.permissions?.filters || {};

export const selectPermissionById = (state, id) => {
  const permissions = state.permissions?.permissions || [];
  return permissions.find(p => p.id === id) || null;
};

export const selectPermissionByCodename = (state, codename) => {
  const permissions = state.permissions?.permissions || [];
  return permissions.find(p => p.codename === codename) || null;
};

export const selectPermissionsByCategoryMap = (state) => {
  const permissions = state.permissions?.permissions || [];
  return permissions.reduce((acc, p) => {
    const category = p.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(p);
    return acc;
  }, {});
};

export const selectPermissionCategories = (state) => {
  const permissions = state.permissions?.permissions || [];
  const categories = [...new Set(permissions.map(p => p.category).filter(Boolean))];
  return categories;
};