import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

const structNotificationSlice = createSlice({
    name: 'structNotifications',
    initialState,
    reducers: {
        addStructNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearStructNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
        markStructNotificationRead: (state, action) => {
            const notification = state.items.find((n) => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount -= 1;
            }
        },
        markAllStructNotificationsRead: (state) => {
            state.items.forEach((n) => (n.read = true));
            state.unreadCount = 0;
        },
        setStructNotifications: (state, action) => {
            state.items = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.read).length;
        },
        setStructNotificationLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setStructNotificationError: (state, action) => {
            state.error = action.payload;
        },
        removeStructNotification: (state, action) => {
            const index = state.items.findIndex((n) => n.id === action.payload);
            if (index !== -1) {
                if (!state.items[index].read) {
                    state.unreadCount -= 1;
                }
                state.items.splice(index, 1);
            }
        },
        resetStructNotifications: () => initialState,
    },
});

export const {
    addStructNotification,
    clearStructNotifications,
    markStructNotificationRead,
    markAllStructNotificationsRead,
    setStructNotifications,
    setStructNotificationLoading,
    setStructNotificationError,
    removeStructNotification,
    resetStructNotifications,
} = structNotificationSlice.actions;

export default structNotificationSlice.reducer;