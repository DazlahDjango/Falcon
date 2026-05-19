// src/store/reviews/slices/selfAssessmentSlice.js
// Redux slice for self assessment state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selfAssessmentService } from '@/services/reviews';

// ========== Async Thunks ==========

export const fetchMySelfAssessment = createAsyncThunk(
    'reviews/selfAssessment/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await selfAssessmentService.getMy();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch self assessment');
        }
    }
);

export const fetchTeamSelfAssessments = createAsyncThunk(
    'reviews/selfAssessment/fetchTeam',
    async (_, { rejectWithValue }) => {
        try {
            const response = await selfAssessmentService.getTeam();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch team assessments');
        }
    }
);

export const fetchPendingSelfAssessments = createAsyncThunk(
    'reviews/selfAssessment/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await selfAssessmentService.getPending();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch pending assessments');
        }
    }
);

export const saveSelfAssessment = createAsyncThunk(
    'reviews/selfAssessment/save',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await selfAssessmentService.save(data);
            if (data.id) {
                await dispatch(fetchMySelfAssessment());
            }
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save assessment');
        }
    }
);

export const submitSelfAssessment = createAsyncThunk(
    'reviews/selfAssessment/submit',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await selfAssessmentService.submit(id);
            await dispatch(fetchMySelfAssessment());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit assessment');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    myAssessment: null,
    teamAssessments: [],
    pendingAssessments: [],
    loading: false,
    submitting: false,
    error: null,
};

// ========== Slice ==========
const selfAssessmentSlice = createSlice({
    name: 'reviewsSelfAssessment',
    initialState,
    reducers: {
        clearSelfAssessmentError: (state) => {
            state.error = null;
        },
        clearSelfAssessment: (state) => {
            state.myAssessment = null;
            state.teamAssessments = [];
            state.pendingAssessments = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMySelfAssessment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMySelfAssessment.fulfilled, (state, action) => {
                state.loading = false;
                state.myAssessment = action.payload;
            })
            .addCase(fetchMySelfAssessment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTeamSelfAssessments.fulfilled, (state, action) => {
                state.teamAssessments = action.payload;
            })
            .addCase(fetchPendingSelfAssessments.fulfilled, (state, action) => {
                state.pendingAssessments = action.payload;
            })
            .addCase(submitSelfAssessment.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitSelfAssessment.fulfilled, (state) => {
                state.submitting = false;
            })
            .addCase(submitSelfAssessment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelfAssessmentError, clearSelfAssessment } = selfAssessmentSlice.actions;
export default selfAssessmentSlice.reducer;