import api from '../api';
import useToast from '../../hooks/kpi/useToast';

/**
 * Notification Service
 * Handles in-app and push notifications
 */
class NotificationService {
    constructor() {
        this.permission = null;
        this.toast = null;
    }

    /**
     * Initialize toast hook
     */
    initToast() {
        if (!this.toast) {
            // This would need to be called from a React component
            // For now, we'll use a placeholder
            console.warn('Notification service not initialized with toast');
        }
    }

    /**
     * Request push notification permission
     * @returns {Promise<boolean>} Permission granted
     */
    async requestPushPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Send push notification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     */
    sendPushNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.warn('Push notifications not permitted');
            return;
        }

        const notification = new Notification(title, {
            icon: '/favicon.ico',
            ...options,
        });

        notification.onclick = (event) => {
            event.preventDefault();
            if (options.onClick) {
                options.onClick();
            }
            notification.close();
        };

        return notification;
    }

    /**
     * Send in-app notification via toast
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {Object} options - Toast options
     */
    sendInAppNotification(message, type = 'info', options = {}) {
        if (this.toast) {
            this.toast[type](message, options);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Updated notification
     */
    async markAsRead(notificationId) {
        const response = await api.patch(`/notifications/${notificationId}/`, { read: true });
        return response.data;
    }

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>} Update result
     */
    async markAllAsRead() {
        const response = await api.post('/notifications/mark-all-read/');
        return response.data;
    }

    /**
     * Get notifications
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Notifications list
     */
    async getNotifications(params = {}) {
        const response = await api.get('/notifications/', { params });
        return response.data;
    }

    /**
     * Get unread count
     * @returns {Promise<number>} Unread count
     */
    async getUnreadCount() {
        const response = await api.get('/notifications/unread-count/');
        return response.data.count;
    }

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<void>}
     */
    async deleteNotification(notificationId) {
        await api.delete(`/notifications/${notificationId}/`);
    }
}

export default new NotificationService();