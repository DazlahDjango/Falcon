// src/store/reviews/slices/supervisorReviewSlice.js
// Redux slice for supervisor review state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supervisorReviewService } from '@/services/reviews';

// ========== Async Thunks ==========

export const fetchReviewQueue = createAsyncThunk(
    'reviews/supervisorReview/fetchQueue',
    async (_, { rejectWithValue }) => {
        try {
            const response = await supervisorReviewService.getQueue();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch review queue');
        }
    }
);

export const getSupervisorReview = createAsyncThunk(
    'reviews/supervisorReview/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await supervisorReviewService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch review');
        }
    }
);

export const saveSupervisorReview = createAsyncThunk(
    'reviews/supervisorReview/save',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await supervisorReviewService.save(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save review');
        }
    }
);

export const submitSupervisorReview = createAsyncThunk(
    'reviews/supervisorReview/submit',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await supervisorReviewService.submit(id);
            await dispatch(fetchReviewQueue());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit review');
        }
    }
);

export const approveSupervisorReview = createAsyncThunk(
    'reviews/supervisorReview/approve',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await supervisorReviewService.approve(id);
            await dispatch(fetchReviewQueue());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve review');
        }
    }
);

export const rejectSupervisorReview = createAsyncThunk(
    'reviews/supervisorReview/reject',
    async ({ id, reason }, { rejectWithValue, dispatch }) => {
        try {
            const response = await supervisorReviewService.reject(id, reason);
            await dispatch(fetchReviewQueue());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject review');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    reviewQueue: [],
    currentReview: null,
    loading: false,
    submitting: false,
    approving: false,
    error: null,
};

// ========== Slice ==========
const supervisorReviewSlice = createSlice({
    name: 'reviewsSupervisorReview',
    initialState,
    reducers: {
        clearSupervisorReviewError: (state) => {
            state.error = null;
        },
        clearCurrentReview: (state) => {
            state.currentReview = null;
        },
        clearReviewQueue: (state) => {
            state.reviewQueue = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviewQueue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviewQueue.fulfilled, (state, action) => {
                state.loading = false;
                state.reviewQueue = action.payload;
            })
            .addCase(fetchReviewQueue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getSupervisorReview.fulfilled, (state, action) => {
                state.currentReview = action.payload;
            })
            .addCase(submitSupervisorReview.pending, (state) => {
                state.submitting = true;
            })
            .addCase(submitSupervisorReview.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(submitSupervisorReview.rejected, (state) => {
                state.submitting = false;
            })
            .addCase(approveSupervisorReview.pending, (state) => {
                state.approving = true;
            })
            .addCase(approveSupervisorReview.fulfilled, (state) => {
                state.approving = false;
            })
            .addCase(approveSupervisorReview.rejected, (state) => {
                state.approving = false;
            });
    },
});

export const { clearSupervisorReviewError, clearCurrentReview, clearReviewQueue } = supervisorReviewSlice.actions;
export default supervisorReviewSlice.reducer;