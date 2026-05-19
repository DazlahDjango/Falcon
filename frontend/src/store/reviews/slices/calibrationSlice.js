// src/store/reviews/slices/calibrationSlice.js
// Redux slice for calibration state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { calibrationSessionService, calibrationRatingService, calibrationCommentService } from '../../../services/reviews';

// ========== Calibration Session Async Thunks ==========

export const fetchCalibrationSessions = createAsyncThunk(
    'reviews/calibration/fetchSessions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await calibrationSessionService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch calibration sessions');
        }
    }
);

export const fetchMyCalibrationSessions = createAsyncThunk(
    'reviews/calibration/fetchMySessions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await calibrationSessionService.getMySessions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch my sessions');
        }
    }
);

export const getCalibrationSessionById = createAsyncThunk(
    'reviews/calibration/getSessionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await calibrationSessionService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch calibration session');
        }
    }
);

export const createCalibrationSession = createAsyncThunk(
    'reviews/calibration/createSession',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await calibrationSessionService.create(data);
            await dispatch(fetchCalibrationSessions());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create calibration session');
        }
    }
);

export const updateCalibrationSession = createAsyncThunk(
    'reviews/calibration/updateSession',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await calibrationSessionService.update(id, data);
            await dispatch(fetchCalibrationSessions());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update calibration session');
        }
    }
);

export const deleteCalibrationSession = createAsyncThunk(
    'reviews/calibration/deleteSession',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await calibrationSessionService.delete(id);
            await dispatch(fetchCalibrationSessions());
            await dispatch(fetchMyCalibrationSessions());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete calibration session');
        }
    }
);

export const startCalibrationSession = createAsyncThunk(
    'reviews/calibration/startSession',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await calibrationSessionService.start(id);
            await dispatch(getCalibrationSessionById(id));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to start calibration session');
        }
    }
);

export const completeCalibrationSession = createAsyncThunk(
    'reviews/calibration/completeSession',
    async ({ id, decisions, notes }, { rejectWithValue, dispatch }) => {
        try {
            const response = await calibrationSessionService.complete(id, decisions, notes);
            await dispatch(getCalibrationSessionById(id));
            await dispatch(fetchCalibrationSessions());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to complete calibration session');
        }
    }
);

export const fetchOutlierReport = createAsyncThunk(
    'reviews/calibration/fetchOutlierReport',
    async (cycleId, { rejectWithValue }) => {
        try {
            const response = await calibrationSessionService.getOutlierReport(cycleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch outlier report');
        }
    }
);

// ========== Calibration Rating Async Thunks ==========

export const adjustCalibrationRating = createAsyncThunk(
    'reviews/calibration/adjustRating',
    async ({ sessionId, finalRatingId, beforeScore, afterScore, reason }, { rejectWithValue }) => {
        try {
            const response = await calibrationRatingService.adjust(sessionId, finalRatingId, beforeScore, afterScore, reason);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to adjust rating');
        }
    }
);

// ========== Calibration Comment Async Thunks ==========

export const addCalibrationComment = createAsyncThunk(
    'reviews/calibration/addComment',
    async ({ sessionId, comment, parentCommentId }, { rejectWithValue }) => {
        try {
            const response = await calibrationCommentService.add(sessionId, comment, parentCommentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add comment');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    sessions: [],
    mySessions: [],
    currentSession: null,
    outlierReport: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const calibrationSlice = createSlice({
    name: 'reviewsCalibration',
    initialState,
    reducers: {
        clearCalibrationError: (state) => {
            state.error = null;
        },
        clearCurrentSession: (state) => {
            state.currentSession = null;
        },
        clearCalibrationState: (state) => {
            state.sessions = [];
            state.mySessions = [];
            state.currentSession = null;
            state.outlierReport = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCalibrationSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalibrationSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
            })
            .addCase(fetchCalibrationSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyCalibrationSessions.fulfilled, (state, action) => {
                state.mySessions = action.payload;
            })
            .addCase(getCalibrationSessionById.fulfilled, (state, action) => {
                state.currentSession = action.payload;
            })
            .addCase(fetchOutlierReport.fulfilled, (state, action) => {
                state.outlierReport = action.payload;
            });
    },
});

export const {
    clearCalibrationError,
    clearCurrentSession,
    clearCalibrationState,
} = calibrationSlice.actions;

export default calibrationSlice.reducer;