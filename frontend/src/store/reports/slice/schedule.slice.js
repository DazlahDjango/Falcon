// ============================================
// apps/reportplt/slice/schedule.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scheduleService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    schedules: [],
    currentSchedule: null,
    dueSchedules: [],
    overdueSchedules: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { frequency: null, status: null, is_active: null, search: '' },
    frequencies: [],
    history: [],
    upcomingRuns: [],
};

export const fetchSchedules = createAsyncThunk(
    'schedule/fetchSchedules',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getSchedules(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchSchedule = createAsyncThunk(
    'schedule/fetchSchedule',
    async (id, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getSchedule(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createSchedule = createAsyncThunk(
    'schedule/createSchedule',
    async (data, { rejectWithValue }) => {
        try {
            const response = await scheduleService.createSchedule(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateSchedule = createAsyncThunk(
    'schedule/updateSchedule',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await scheduleService.updateSchedule(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteSchedule = createAsyncThunk(
    'schedule/deleteSchedule',
    async (id, { rejectWithValue }) => {
        try {
            await scheduleService.deleteSchedule(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const performScheduleAction = createAsyncThunk(
    'schedule/performAction',
    async ({ id, action }, { rejectWithValue }) => {
        try {
            const response = await scheduleService.performAction(id, action);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchScheduleHistory = createAsyncThunk(
    'schedule/fetchScheduleHistory',
    async (id, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getScheduleHistory(id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchUpcomingRuns = createAsyncThunk(
    'schedule/fetchUpcomingRuns',
    async (id, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getUpcomingRuns(id);
            return { id, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDueSchedules = createAsyncThunk(
    'schedule/fetchDueSchedules',
    async (_, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getDueSchedules();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchOverdueSchedules = createAsyncThunk(
    'schedule/fetchOverdueSchedules',
    async (_, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getOverdueSchedules();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchFrequencies = createAsyncThunk(
    'schedule/fetchFrequencies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await scheduleService.getFrequencies();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        clearCurrentSchedule: (state) => {
            state.currentSchedule = null;
            state.history = [];
            state.upcomingRuns = [];
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearAllSchedules: (state) => {
            state.schedules = [];
            state.dueSchedules = [];
            state.overdueSchedules = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchedules.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSchedules.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.schedules = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchSchedules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSchedule.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchSchedule.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentSchedule = action.payload;
                const index = state.schedules.findIndex(s => s.id === action.payload.id);
                if (index !== -1) state.schedules[index] = action.payload;
            })
            .addCase(fetchSchedule.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createSchedule.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createSchedule.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentSchedule = action.payload;
                state.schedules.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createSchedule.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateSchedule.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateSchedule.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentSchedule = action.payload;
                const index = state.schedules.findIndex(s => s.id === action.payload.id);
                if (index !== -1) state.schedules[index] = action.payload;
            })
            .addCase(updateSchedule.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteSchedule.fulfilled, (state, action) => {
                state.schedules = state.schedules.filter(s => s.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(performScheduleAction.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.schedules.findIndex(s => s.id === action.payload.id);
                    if (index !== -1) state.schedules[index] = action.payload;
                    if (state.currentSchedule?.id === action.payload.id) state.currentSchedule = action.payload;
                }
            })
            .addCase(fetchScheduleHistory.fulfilled, (state, action) => {
                state.history = action.payload.data || [];
            })
            .addCase(fetchUpcomingRuns.fulfilled, (state, action) => {
                state.upcomingRuns = action.payload.data || [];
            })
            .addCase(fetchDueSchedules.fulfilled, (state, action) => {
                state.dueSchedules = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchOverdueSchedules.fulfilled, (state, action) => {
                state.overdueSchedules = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchFrequencies.fulfilled, (state, action) => {
                state.frequencies = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentSchedule,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllSchedules,
} = scheduleSlice.actions;

// Aliases for compatibility with useSchedules hook
export const clearScheduleErrors = clearErrors;
export const setScheduleFilters = setFilters;
export const resetScheduleFilters = resetFilters;
export const setSchedulePagination = setPagination;

export default scheduleSlice.reducer;