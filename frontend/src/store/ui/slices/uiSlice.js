import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Toast notifications
  toasts: [],
  // Global loading states
  globalLoading: false,
  loadingOverlay: false,
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  // Modals
  modals: {
    confirm: {
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
    },
  },
  // Network status
  isOnline: navigator.onLine,
  // Last activity timestamp
  lastActivity: Date.now(),
};
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        title: action.payload.title,
        duration: action.payload.duration || 5000,
        createdAt: Date.now(),
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setLoadingOverlay: (state, action) => {
      state.loadingOverlay = action.payload;
    },
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      // Apply theme to document
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    // Sidebar
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed);
    },
    // Confirm Modal
    openConfirmModal: (state, action) => {
      state.modals.confirm = {
        isOpen: true,
        title: action.payload.title || 'Confirm Action',
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
      };
    },
    closeConfirmModal: (state) => {
      state.modals.confirm = {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      };
    },
    // Network status
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    // Activity tracking
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
  },
});

// Action creators
export const {
  addToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
  setLoadingOverlay,
  setTheme,
  toggleTheme,
  setSidebarCollapsed,
  toggleSidebar,
  openConfirmModal,
  closeConfirmModal,
  setOnlineStatus,
  updateLastActivity,
} = uiSlice.actions;

export const showToast = (message, type = 'info', title = null, duration = 5000) => (dispatch) => {
  dispatch(addToast({ message, type, title, duration }));
};
export const showSuccessToast = (message, title = 'Success') => (dispatch) => {
  dispatch(addToast({ message, type: 'success', title, duration: 4000 }));
};
export const showErrorToast = (message, title = 'Error') => (dispatch) => {
  dispatch(addToast({ message, type: 'error', title, duration: 6000 }));
};
export const showWarningToast = (message, title = 'Warning') => (dispatch) => {
  dispatch(addToast({ message, type: 'warning', title, duration: 5000 }));
};
export const showInfoToast = (message, title = 'Information') => (dispatch) => {
  dispatch(addToast({ message, type: 'info', title, duration: 4000 }));
};
export default uiSlice.reducer;