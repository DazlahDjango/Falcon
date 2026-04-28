import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    settings: {
        pushEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        types: {
            kpi_approved: true,
            kpi_rejected: true,
            target_assigned: true,
            validation_pending: true,
            red_alert: true,
        },
    },
};

const notificationSlice = createSlice({
    name: 'kpiNotifications',
    initialState,
    reducers: {
        fetchNotificationsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchNotificationsSuccess: (state, action) => {
            state.loading = false;
            state.notifications = action.payload.results;
            state.unreadCount = action.payload.unread_count || 0;
        },
        fetchNotificationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },
        
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
            state.unreadCount = 0;
        },
        
        removeNotification: (state, action) => {
            const index = state.notifications.findIndex(n => n.id === action.payload);
            if (index !== -1) {
                const notification = state.notifications[index];
                if (!notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications.splice(index, 1);
            }
        },
        
        updateSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateSettings,
    clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;