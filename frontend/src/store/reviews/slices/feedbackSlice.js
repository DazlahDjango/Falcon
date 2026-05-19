// src/store/reviews/slices/feedbackSlice.js
// Redux slice for feedback state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackRequestService, feedbackResponseService, feedbackSummaryService } from '@/services/reviews';

// ========== Feedback Request Async Thunks ==========

export const fetchFeedbackRequests = createAsyncThunk(
    'reviews/feedback/fetchRequests',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await feedbackRequestService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch feedback requests');
        }
    }
);

export const fetchPendingFeedbackRequests = createAsyncThunk(
    'reviews/feedback/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await feedbackRequestService.getPending();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch pending requests');
        }
    }
);

export const createFeedbackRequest = createAsyncThunk(
    'reviews/feedback/createRequest',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await feedbackRequestService.create(data);
            await dispatch(fetchFeedbackRequests());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create feedback request');
        }
    }
);

export const deleteFeedbackRequest = createAsyncThunk(
    'reviews/feedback/deleteRequest',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await feedbackRequestService.delete(id);
            await dispatch(fetchFeedbackRequests());
            await dispatch(fetchPendingFeedbackRequests());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete feedback request');
        }
    }
);

export const sendFeedbackReminder = createAsyncThunk(
    'reviews/feedback/sendReminder',
    async (id, { rejectWithValue }) => {
        try {
            const response = await feedbackRequestService.sendReminder(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to send reminder');
        }
    }
);

// ========== Feedback Response Async Thunks ==========

export const submitFeedbackResponse = createAsyncThunk(
    'reviews/feedback/submitResponse',
    async ({ requestId, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await feedbackResponseService.submit(requestId, data);
            await dispatch(fetchPendingFeedbackRequests());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit feedback response');
        }
    }
);

// ========== Feedback Summary Async Thunks ==========

export const fetchMyFeedbackSummary = createAsyncThunk(
    'reviews/feedback/fetchMySummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await feedbackSummaryService.getMy();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch feedback summary');
        }
    }
);

export const shareFeedbackSummary = createAsyncThunk(
    'reviews/feedback/shareSummary',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await feedbackSummaryService.share(id);
            await dispatch(fetchMyFeedbackSummary());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to share feedback summary');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    requests: [],
    pendingRequests: [],
    mySummary: null,
    currentRequest: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const feedbackSlice = createSlice({
    name: 'reviewsFeedback',
    initialState,
    reducers: {
        clearFeedbackError: (state) => {
            state.error = null;
        },
        clearCurrentRequest: (state) => {
            state.currentRequest = null;
        },
        clearFeedbackState: (state) => {
            state.requests = [];
            state.pendingRequests = [];
            state.mySummary = null;
            state.currentRequest = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedbackRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeedbackRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchFeedbackRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPendingFeedbackRequests.fulfilled, (state, action) => {
                state.pendingRequests = action.payload;
            })
            .addCase(fetchMyFeedbackSummary.fulfilled, (state, action) => {
                state.mySummary = action.payload;
            })
            .addCase(createFeedbackRequest.fulfilled, (state, action) => {
                state.currentRequest = action.payload;
            })
            .addCase(submitFeedbackResponse.fulfilled, (state) => {
                // Response submitted successfully
            });
    },
});

export const {
    clearFeedbackError,
    clearCurrentRequest,
    clearFeedbackState,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;