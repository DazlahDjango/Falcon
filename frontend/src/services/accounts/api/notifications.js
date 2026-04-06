import { request } from './client';

// Notification CRUD
// ===================
export const getNotifications = (params = {}) => {
    return request.get('/notifications/', { params });
};
export const getNotificationById = (notificationId) => {
    return request.get(`/notifications/${notificationId}/`);
};
export const markAsRead = (notificationId) => {
    return request.post(`/notifications/${notificationId}/read/`);
};
export const markAllAsRead = () => {
    return request.post('/notifications/mark-all-read/');
};
export const deleteNotification = (notificationId) => {
    return request.delete(`/notifications/${notificationId}/`);
};
export const getUnreadCount = () => {
    return request.get('/notifications/unread-count/');
};
export const getNotificationPreferences = () => {
    return request.get('/notifications/preferences/');
};
export const updateNotificationPreferences = (data) => {
    return request.patch('/notifications/preferences/', data);
};