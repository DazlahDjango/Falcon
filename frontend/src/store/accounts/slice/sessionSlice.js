import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sessionsApi from '../../../services/accounts/api/sessions';

// Async Thunks
// ==============
export const fetchSessions = createAsyncThunk(
    'sessions/fetch',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await sessionsApi.getSessions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch sessions');
        }
    }
);
export const fetchActiveSessions = createAsyncThunk(
    'sessions/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sessionsApi.getActiveSessions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch active sessions');
        }
    }
);
export const terminateSession = createAsyncThunk(
    'sessions/terminate',
    async (sessionId, { rejectWithValue }) => {
        try {
            await sessionsApi.terminateSession(sessionId);
            return sessionId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to terminate session');
        }
    }
);
export const terminateAllSessions = createAsyncThunk(
    'sessions/terminateAll',
    async (_, { rejectWithValue }) => {
        try {
            await sessionsApi.terminateAllSessions();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to terminate sessions');
        }
    }
);

// Initial State
// ==============
const initialState = {
    sessions: [],
    activeSessions: [],
    currentSession: null,
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
const sessionSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentSession: (state, action) => {
            state.currentSession = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Sessions
            .addCase(fetchSessions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sessions = action.payload.results;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total_pages: action.payload.total_pages,
                    total_items: action.payload.count,
                    page_size: action.payload.page_size
                };
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch Active Sessions
            .addCase(fetchActiveSessions.fulfilled, (state, action) => {
                state.activeSessions = action.payload.sessions;
                state.currentSession = action.payload.sessions.find(s => s.is_current);
            })
            // Terminate Session
            .addCase(terminateSession.fulfilled, (state, action) => {
                state.sessions = state.sessions.filter(s => s.id !== action.payload);
                state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload);
            })
            // Terminate All Sessions
            .addCase(terminateAllSessions.fulfilled, (state) => {
                state.activeSessions = state.activeSessions.filter(s => s.is_current);
                state.sessions = state.sessions.filter(s => s.is_current);
            });
    }
});
export const { clearError, setCurrentSession } = sessionSlice.actions;

export default sessionSlice.reducer;