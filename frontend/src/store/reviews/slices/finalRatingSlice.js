// src/store/reviews/slices/finalRatingSlice.js
// Redux slice for final rating state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { finalRatingService } from '@/services/reviews';

// ========== Async Thunks ==========

export const fetchFinalRatings = createAsyncThunk(
    'reviews/finalRatings/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await finalRatingService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch final ratings');
        }
    }
);

export const fetchMyFinalRating = createAsyncThunk(
    'reviews/finalRatings/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await finalRatingService.getMy();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch my rating');
        }
    }
);

export const fetchTeamFinalRatings = createAsyncThunk(
    'reviews/finalRatings/fetchTeam',
    async (_, { rejectWithValue }) => {
        try {
            const response = await finalRatingService.getTeam();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch team ratings');
        }
    }
);

export const getFinalRatingById = createAsyncThunk(
    'reviews/finalRatings/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await finalRatingService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rating');
        }
    }
);

export const approveFinalRating = createAsyncThunk(
    'reviews/finalRatings/approve',
    async ({ id, notes }, { rejectWithValue, dispatch }) => {
        try {
            const response = await finalRatingService.approve(id, notes);
            await dispatch(fetchFinalRatings());
            await dispatch(fetchMyFinalRating());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve rating');
        }
    }
);

export const lockFinalRating = createAsyncThunk(
    'reviews/finalRatings/lock',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await finalRatingService.lock(id);
            await dispatch(fetchFinalRatings());
            await dispatch(fetchMyFinalRating());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to lock rating');
        }
    }
);

export const calibrateFinalRating = createAsyncThunk(
    'reviews/finalRatings/calibrate',
    async ({ id, adjustedScore, reason }, { rejectWithValue, dispatch }) => {
        try {
            const response = await finalRatingService.calibrate(id, adjustedScore, reason);
            await dispatch(fetchFinalRatings());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to calibrate rating');
        }
    }
);

export const fetchRatingDistribution = createAsyncThunk(
    'reviews/finalRatings/fetchDistribution',
    async (cycleId, { rejectWithValue }) => {
        try {
            const response = await finalRatingService.getDistribution(cycleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rating distribution');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    finalRatings: [],
    myRating: null,
    teamRatings: [],
    currentRating: null,
    distribution: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const finalRatingSlice = createSlice({
    name: 'reviewsFinalRatings',
    initialState,
    reducers: {
        clearFinalRatingError: (state) => {
            state.error = null;
        },
        clearCurrentRating: (state) => {
            state.currentRating = null;
        },
        clearFinalRatingState: (state) => {
            state.finalRatings = [];
            state.myRating = null;
            state.teamRatings = [];
            state.currentRating = null;
            state.distribution = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFinalRatings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinalRatings.fulfilled, (state, action) => {
                state.loading = false;
                state.finalRatings = action.payload;
            })
            .addCase(fetchFinalRatings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyFinalRating.fulfilled, (state, action) => {
                state.myRating = action.payload;
            })
            .addCase(fetchTeamFinalRatings.fulfilled, (state, action) => {
                state.teamRatings = action.payload;
            })
            .addCase(getFinalRatingById.fulfilled, (state, action) => {
                state.currentRating = action.payload;
            })
            .addCase(fetchRatingDistribution.fulfilled, (state, action) => {
                state.distribution = action.payload;
            });
    },
});

export const {
    clearFinalRatingError,
    clearCurrentRating,
    clearFinalRatingState,
} = finalRatingSlice.actions;

export default finalRatingSlice.reducer;