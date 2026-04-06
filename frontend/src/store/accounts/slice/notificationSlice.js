import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationsApi from '../../../services/accounts/api/notifications';

// Async Thunks
// =============
export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await notificationsApi.getNotifications(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
        }
    }
);
export const markAsRead = createAsyncThunk(
    'notifications/markRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
        }
    }
);
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationsApi.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read');
        }
    }
);
export const fetchUnreadCount = createAsyncThunk(
    'notifications/unreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const count = await notificationsApi.getUnreadCount();
            return count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch unread count');
        }
    }
);

// Initial State
// ==============
const initialState = {
    notifications: [],
    unreadCount: 0,
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 20
    },
    isLoading: false,
    error: null
};

// Slice
// ======
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.results;
                state.unreadCount = action.payload.unread_count;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Mark as Read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            
            // Mark All as Read
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => { n.read = true; });
                state.unreadCount = 0;
            })
            
            // Fetch Unread Count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    }
});
export const { clearError, addNotification, clearNotifications } = notificationSlice.actions;
// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;