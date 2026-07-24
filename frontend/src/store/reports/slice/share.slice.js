// ============================================
// apps/reportplt/slice/share.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shareService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    shares: [],
    currentShare: null,
    sharedWithMe: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { share_type: null, permission: null, is_active: null, report: null },
    types: [],
    permissions: [],
    accessToken: null,
};

export const fetchShares = createAsyncThunk(
    'share/fetchShares',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await shareService.getShares(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchShare = createAsyncThunk(
    'share/fetchShare',
    async (id, { rejectWithValue }) => {
        try {
            const response = await shareService.getShare(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createShare = createAsyncThunk(
    'share/createShare',
    async (data, { rejectWithValue }) => {
        try {
            const response = await shareService.createShare(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateShare = createAsyncThunk(
    'share/updateShare',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await shareService.updateShare(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteShare = createAsyncThunk(
    'share/deleteShare',
    async (id, { rejectWithValue }) => {
        try {
            await shareService.deleteShare(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const accessShare = createAsyncThunk(
    'share/accessShare',
    async ({ token, password = null }, { rejectWithValue }) => {
        try {
            const response = await shareService.accessShare(token, password);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deactivateShare = createAsyncThunk(
    'share/deactivateShare',
    async (id, { rejectWithValue }) => {
        try {
            const response = await shareService.deactivateShare(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const activateShare = createAsyncThunk(
    'share/activateShare',
    async (id, { rejectWithValue }) => {
        try {
            const response = await shareService.activateShare(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchSharesByReport = createAsyncThunk(
    'share/fetchSharesByReport',
    async (reportId, { rejectWithValue }) => {
        try {
            const response = await shareService.getSharesByReport(reportId);
            return { reportId, data: response.data };
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchShareTypes = createAsyncThunk(
    'share/fetchShareTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await shareService.getShareTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchSharePermissions = createAsyncThunk(
    'share/fetchSharePermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await shareService.getSharePermissions();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const shareSlice = createSlice({
    name: 'share',
    initialState,
    reducers: {
        clearCurrentShare: (state) => {
            state.currentShare = null;
            state.accessToken = null;
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
        clearAllShares: (state) => {
            state.shares = [];
            state.sharedWithMe = [];
            state.pagination = initialState.pagination;
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShares.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShares.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.shares = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchShares.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchShare.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchShare.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentShare = action.payload;
                const index = state.shares.findIndex(s => s.id === action.payload.id);
                if (index !== -1) state.shares[index] = action.payload;
            })
            .addCase(fetchShare.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createShare.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createShare.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentShare = action.payload;
                state.shares.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createShare.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateShare.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateShare.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentShare = action.payload;
                const index = state.shares.findIndex(s => s.id === action.payload.id);
                if (index !== -1) state.shares[index] = action.payload;
            })
            .addCase(updateShare.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteShare.fulfilled, (state, action) => {
                state.shares = state.shares.filter(s => s.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(accessShare.fulfilled, (state, action) => {
                state.accessToken = action.payload?.token || null;
                if (action.payload?.share) {
                    state.currentShare = action.payload.share;
                }
            })
            .addCase(deactivateShare.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.shares.findIndex(s => s.id === action.payload.id);
                    if (index !== -1) state.shares[index] = action.payload;
                    if (state.currentShare?.id === action.payload.id) state.currentShare = action.payload;
                }
            })
            .addCase(activateShare.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.shares.findIndex(s => s.id === action.payload.id);
                    if (index !== -1) state.shares[index] = action.payload;
                    if (state.currentShare?.id === action.payload.id) state.currentShare = action.payload;
                }
            })
            .addCase(fetchShareTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchSharePermissions.fulfilled, (state, action) => {
                state.permissions = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentShare,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllShares,
    setAccessToken,
} = shareSlice.actions;

// Aliases for compatibility with useShares hook
export const clearShareErrors = clearErrors;
export const setShareFilters = setFilters;
export const resetShareFilters = resetFilters;
export const setSharePagination = setPagination;

export default shareSlice.reducer;