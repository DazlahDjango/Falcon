import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  lastFetched: null,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'structNotifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || Date.now(),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        read: false,
        createdAt: action.payload.timestamp || Date.now(),
        data: action.payload.data,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setNotifications,
  setLoading,
  setError,
} = notificationSlice.actions;

export default notificationSlice.reducer;