// src/store/reviews/slices/ratingScaleSlice.js
// Redux slice for rating scale state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ratingScaleService } from '@/services/reviews';

// ========== Async Thunks ==========

export const fetchRatingScales = createAsyncThunk(
    'reviews/ratingScales/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await ratingScaleService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rating scales');
        }
    }
);

export const fetchDefaultRatingScale = createAsyncThunk(
    'reviews/ratingScales/fetchDefault',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ratingScaleService.getDefault();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch default rating scale');
        }
    }
);

export const getRatingScaleById = createAsyncThunk(
    'reviews/ratingScales/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await ratingScaleService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rating scale');
        }
    }
);

export const createRatingScale = createAsyncThunk(
    'reviews/ratingScales/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await ratingScaleService.create(data);
            await dispatch(fetchRatingScales());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create rating scale');
        }
    }
);

export const updateRatingScale = createAsyncThunk(
    'reviews/ratingScales/update',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await ratingScaleService.update(id, data);
            await dispatch(fetchRatingScales());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update rating scale');
        }
    }
);

export const deleteRatingScale = createAsyncThunk(
    'reviews/ratingScales/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await ratingScaleService.delete(id);
            await dispatch(fetchRatingScales());
            await dispatch(fetchDefaultRatingScale());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete rating scale');
        }
    }
);

export const setDefaultRatingScale = createAsyncThunk(
    'reviews/ratingScales/setDefault',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await ratingScaleService.setDefault(id);
            await dispatch(fetchRatingScales());
            await dispatch(fetchDefaultRatingScale());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to set default rating scale');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    ratingScales: [],
    defaultScale: null,
    currentScale: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const ratingScaleSlice = createSlice({
    name: 'reviewsRatingScales',
    initialState,
    reducers: {
        clearRatingScaleError: (state) => {
            state.error = null;
        },
        clearRatingScales: (state) => {
            state.ratingScales = [];
            state.defaultScale = null;
            state.currentScale = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRatingScales.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRatingScales.fulfilled, (state, action) => {
                state.loading = false;
                state.ratingScales = action.payload;
            })
            .addCase(fetchRatingScales.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDefaultRatingScale.fulfilled, (state, action) => {
                state.defaultScale = action.payload;
            })
            .addCase(getRatingScaleById.fulfilled, (state, action) => {
                state.currentScale = action.payload;
            });
    },
});

export const { clearRatingScaleError, clearRatingScales } = ratingScaleSlice.actions;
export default ratingScaleSlice.reducer;