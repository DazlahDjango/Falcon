import { createSlice } from '@reduxjs/toolkit';

// ============================================================
// Initial State
// ============================================================

const initialState = {
  sidebarOpen: true,
  darkMode: false,
  notifications: [],
  activeModal: null,
  loadingOverlay: false,
  toast: {
    visible: false,
    message: '',
    type: 'info', // success, error, warning, info
  },
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  },
};

// ============================================================
// Slice
// ============================================================

const uiSlice = createSlice({
  name: 'orgUi',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Dark Mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    // Notifications
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    // Modal
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    
    // Loading Overlay
    showLoadingOverlay: (state) => {
      state.loadingOverlay = true;
    },
    hideLoadingOverlay: (state) => {
      state.loadingOverlay = false;
    },
    
    // Toast
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
      state.toast.message = '';
    },
    
    // Confirm Dialog
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        open: true,
        title: action.payload.title || 'Confirm',
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog.open = false;
      state.confirmDialog.onConfirm = null;
      state.confirmDialog.onCancel = null;
    },
  },
});

// ============================================================
// Actions & Reducer
// ============================================================

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  removeNotification,
  openModal,
  closeModal,
  showLoadingOverlay,
  hideLoadingOverlay,
  showToast,
  hideToast,
  showConfirmDialog,
  hideConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;