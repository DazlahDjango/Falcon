// src/store/reviews/slices/insightSlice.js
// Redux slice for AI insights state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { insightService } from '@/services/reviews';

// ========== Async Thunks ==========

// Fetch insights
export const fetchInsights = createAsyncThunk(
    'reviews/insights/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await insightService.getInsights(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch insights');
        }
    }
);

// Generate new insights
export const generateInsights = createAsyncThunk(
    'reviews/insights/generate',
    async (data = {}, { rejectWithValue, dispatch }) => {
        try {
            const response = await insightService.generateInsights(data);
            await dispatch(fetchInsights({ status: 'unread' }));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to generate insights');
        }
    }
);

// Dismiss single insight
export const dismissInsight = createAsyncThunk(
    'reviews/insights/dismiss',
    async (insightId, { rejectWithValue, dispatch }) => {
        try {
            const response = await insightService.dismissInsight(insightId);
            await dispatch(fetchInsights());
            await dispatch(fetchUnreadCount());
            return { insightId, ...response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to dismiss insight');
        }
    }
);

// Bulk dismiss insights
export const bulkDismissInsights = createAsyncThunk(
    'reviews/insights/bulkDismiss',
    async (insightIds, { rejectWithValue, dispatch }) => {
        try {
            const response = await insightService.bulkDismissInsights(insightIds);
            await dispatch(fetchInsights());
            await dispatch(fetchUnreadCount());
            return { insightIds, ...response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to dismiss insights');
        }
    }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
    'reviews/insights/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await insightService.getUnreadCount();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch unread count');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    insights: [],
    totalCount: 0,
    unreadCount: 0,
    generating: false,
    loading: false,
    error: null,
    filters: {
        type: null,
        status: 'unread',
        limit: 20,
        offset: 0,
    },
    lastGenerated: null,
};

// ========== Slice ==========
const insightSlice = createSlice({
    name: 'reviews/insights',
    initialState,
    reducers: {
        clearInsightErrors: (state) => {
            state.error = null;
        },
        setInsightFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload, offset: 0 };
        },
        resetInsightFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearAllInsights: (state) => {
            return initialState;
        },
        removeInsightLocally: (state, action) => {
            state.insights = state.insights.filter(i => i.id !== action.payload);
            state.totalCount -= 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== Fetch Insights ==========
            .addCase(fetchInsights.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInsights.fulfilled, (state, action) => {
                state.loading = false;
                state.insights = action.payload.results || action.payload;
                state.totalCount = action.payload.count || 0;
            })
            .addCase(fetchInsights.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Generate Insights ==========
            .addCase(generateInsights.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(generateInsights.fulfilled, (state, action) => {
                state.generating = false;
                state.lastGenerated = new Date().toISOString();
            })
            .addCase(generateInsights.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            })
            
            // ========== Dismiss Insight ==========
            .addCase(dismissInsight.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(dismissInsight.fulfilled, (state, action) => {
                state.loading = false;
                state.insights = state.insights.filter(i => i.id !== action.payload.insightId);
                state.totalCount -= 1;
            })
            .addCase(dismissInsight.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Bulk Dismiss ==========
            .addCase(bulkDismissInsights.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkDismissInsights.fulfilled, (state, action) => {
                state.loading = false;
                state.insights = state.insights.filter(i => !action.payload.insightIds.includes(i.id));
                state.totalCount -= action.payload.insightIds.length;
            })
            .addCase(bulkDismissInsights.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Fetch Unread Count ==========
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count || 0;
            });
    },
});

// ========== Actions ==========
export const {
    clearInsightErrors,
    setInsightFilters,
    resetInsightFilters,
    clearAllInsights,
    removeInsightLocally,
} = insightSlice.actions;

// ========== Selectors ==========
export const selectAllInsights = (state) => state.reviewsInsights.insights;
export const selectInsightsTotalCount = (state) => state.reviewsInsights.totalCount;
export const selectInsightsUnreadCount = (state) => state.reviewsInsights.unreadCount;
export const selectInsightsLoading = (state) => state.reviewsInsights.loading;
export const selectInsightsGenerating = (state) => state.reviewsInsights.generating;
export const selectInsightsError = (state) => state.reviewsInsights.error;
export const selectInsightFilters = (state) => state.reviewsInsights.filters;
export const selectInsightsByType = (state, type) => 
    state.reviewsInsights.insights.filter(insight => insight.type === type);
export const selectUnreadInsights = (state) => 
    state.reviewsInsights.insights.filter(insight => insight.status === 'unread');

export default insightSlice.reducer;