import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    sidebarOpen: true,
    notifications: [],
    modals: [],
    loading: {
        global: false,
        actions: {},
    },
    toasts: [],
    alerts: [],
};
const uiSlice = createSlice({
    name: 'kpiUi',
    initialState,
    reducers: {
        // Theme
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        // Sidebar
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        // Notifications
        addNotification: (state, action) => {
            const notification = {
                id: Date.now(),
                read: false,
                ...action.payload,
            };
            state.notifications.unshift(notification);
        },
        markNotificationRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllNotificationsRead: (state) => {
            state.notifications.forEach(n => { n.read = true; });
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        // Modals
        openModal: (state, action) => {
            state.modals.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        closeModal: (state, action) => {
            state.modals = state.modals.filter(m => m.id !== action.payload);
        },
        closeAllModals: (state) => {
            state.modals = [];
        },
        // Loading states
        setGlobalLoading: (state, action) => {
            state.loading.global = action.payload;
        },
        startActionLoading: (state, action) => {
            state.loading.actions[action.payload] = true;
        },
        stopActionLoading: (state, action) => {
            state.loading.actions[action.payload] = false;
        },
        // Toasts
        addToast: (state, action) => {
            const toast = {
                id: Date.now(),
                type: 'info',
                duration: 3000,
                ...action.payload,
            };
            state.toasts.push(toast);
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(t => t.id !== action.payload);
        },
        // Alerts
        addAlert: (state, action) => {
            const alert = {
                id: Date.now(),
                type: 'info',
                ...action.payload,
            };
            state.alerts.push(alert);
        },
        removeAlert: (state, action) => {
            state.alerts = state.alerts.filter(a => a.id !== action.payload);
        },
        clearAlerts: (state) => {
            state.alerts = [];
        },
    },
});
export const {
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    removeNotification,
    openModal,
    closeModal,
    closeAllModals,
    setGlobalLoading,
    startActionLoading,
    stopActionLoading,
    addToast,
    removeToast,
    addAlert,
    removeAlert,
    clearAlerts,
} = uiSlice.actions;
export default uiSlice.reducer;