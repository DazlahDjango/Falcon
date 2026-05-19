// src/store/reviews/slices/notificationSlice.js
// Redux slice for notification state

import { createSlice } from '@reduxjs/toolkit';

// ========== Initial State ==========
const initialState = {
    notifications: [],
    unreadCount: 0,
    latestNotification: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const notificationSlice = createSlice({
    name: 'reviewsNotifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.is_read) {
                state.unreadCount += 1;
            }
            state.latestNotification = action.payload;
        },
        markNotificationRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllNotificationsRead: (state) => {
            state.notifications.forEach(n => { n.is_read = true; });
            state.unreadCount = 0;
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.is_read).length;
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.latestNotification = null;
        },
        setNotificationError: (state, action) => {
            state.error = action.payload;
        },
        clearNotificationError: (state) => {
            state.error = null;
        },
    },
});

export const {
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    setNotifications,
    setUnreadCount,
    clearNotifications,
    setNotificationError,
    clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;