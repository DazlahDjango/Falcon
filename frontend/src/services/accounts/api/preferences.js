import { request } from './client';

// User Preferences
// ====================
export const getUserPreferences = () => {
    return request.get('/preferences/users/my/');
};
export const updateUserPreferences = (data) => {
    return request.patch('/preferences/users/my/', data);
};
export const updateNotificationSettings = (eventType, channels) => {
    return request.post('/preferences/users/notifications/', { event_type: eventType, channels });
};

// Tenant Preferences
// =====================
export const getTenantPreferences = () => {
    return request.get('/preferences/tenants/my-tenant/');
};
export const updateTenantPreferences = (data) => {
    return request.patch('/preferences/tenants/my-tenant/', data);
};
export const updateTenantBranding = (data) => {
    return request.patch('/preferences/tenants/my-tenant/branding/', data);
};