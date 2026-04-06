import { createSlice } from '@reduxjs/toolkit';

// Initial State
// ==============
const initialState = {
    isLoading: false,
    loadingCount: 0,
    alerts: [],
    modals: {},
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'light',
    notificationsEnabled: true,
    confirmDialog: null
};

// Slice
// ======
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Loading actions
        startLoading: (state) => {
            state.loadingCount += 1;
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.loadingCount = Math.max(0, state.loadingCount - 1);
            state.isLoading = state.loadingCount > 0;
        },
        resetLoading: (state) => {
            state.loadingCount = 0;
            state.isLoading = false;
        },
        // Alert actions
        showAlert: (state, action) => {
            const { type, message, description, timeout = 5000, id = Date.now() } = action.payload;
            state.alerts.push({
                id,
                type,
                message,
                description,
                timeout
            });
        },
        removeAlert: (state, action) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
        },
        clearAlerts: (state) => {
            state.alerts = [];
        },
        // Modal actions
        openModal: (state, action) => {
            const { modalId, props = {} } = action.payload;
            state.modals[modalId] = { isOpen: true, props };
        },
        closeModal: (state, action) => {
            const { modalId } = action.payload;
            if (state.modals[modalId]) {
                state.modals[modalId].isOpen = false;
            }
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(key => {
                state.modals[key].isOpen = false;
            });
        },
        // Sidebar actions
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        toggleSidebarCollapsed: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        // Theme actions
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        // Notification settings
        setNotificationsEnabled: (state, action) => {
            state.notificationsEnabled = action.payload;
        },
        // Confirmation dialog
        showConfirmDialog: (state, action) => {
            state.confirmDialog = {
                isOpen: true,
                ...action.payload
            };
        },
        hideConfirmDialog: (state) => {
            state.confirmDialog = null;
        }
    }
});

export const {
    startLoading,
    stopLoading,
    resetLoading,
    showAlert,
    removeAlert,
    clearAlerts,
    openModal,
    closeModal,
    closeAllModals,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setTheme,
    toggleTheme,
    setNotificationsEnabled,
    showConfirmDialog,
    hideConfirmDialog
} = uiSlice.actions;

// Selectors
export const selectIsLoading = (state) => state.ui.isLoading;
export const selectAlerts = (state) => state.ui.alerts;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;

export default uiSlice.reducer;