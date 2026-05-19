// src/store/reviews/slices/cycleSlice.js
// Redux slice for review cycle state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cycleService } from '@/services/reviews';

// ========== Async Thunks ==========

// Fetch all cycles
export const fetchCycles = createAsyncThunk(
    'reviews/cycles/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await cycleService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cycles');
        }
    }
);

// Fetch active cycle
export const fetchActiveCycle = createAsyncThunk(
    'reviews/cycles/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cycleService.getActive();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch active cycle');
        }
    }
);

// Fetch upcoming cycles
export const fetchUpcomingCycles = createAsyncThunk(
    'reviews/cycles/fetchUpcoming',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cycleService.getUpcoming();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch upcoming cycles');
        }
    }
);

// Fetch my cycles
export const fetchMyCycles = createAsyncThunk(
    'reviews/cycles/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cycleService.getMyCycles();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch my cycles');
        }
    }
);

// Get cycle by ID
export const getCycleById = createAsyncThunk(
    'reviews/cycles/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await cycleService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cycle');
        }
    }
);

// Get cycle progress
export const fetchCycleProgress = createAsyncThunk(
    'reviews/cycles/fetchProgress',
    async (id, { rejectWithValue }) => {
        try {
            const response = await cycleService.getProgress(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cycle progress');
        }
    }
);

// Create cycle
export const createCycle = createAsyncThunk(
    'reviews/cycles/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.create(data);
            await dispatch(fetchCycles());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create cycle');
        }
    }
);

// Update cycle
export const updateCycle = createAsyncThunk(
    'reviews/cycles/update',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.update(id, data);
            await dispatch(fetchCycles());
            await dispatch(fetchActiveCycle());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update cycle');
        }
    }
);

// Delete cycle
export const deleteCycle = createAsyncThunk(
    'reviews/cycles/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.delete(id);
            await dispatch(fetchCycles());
            await dispatch(fetchActiveCycle());
            await dispatch(fetchUpcomingCycles());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete cycle');
        }
    }
);

// Activate cycle
export const activateCycle = createAsyncThunk(
    'reviews/cycles/activate',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.activate(id);
            await dispatch(fetchCycles());
            await dispatch(fetchActiveCycle());
            await dispatch(fetchUpcomingCycles());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to activate cycle');
        }
    }
);

// Close cycle
export const closeCycle = createAsyncThunk(
    'reviews/cycles/close',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.close(id);
            await dispatch(fetchCycles());
            await dispatch(fetchActiveCycle());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to close cycle');
        }
    }
);

// Archive cycle
export const archiveCycle = createAsyncThunk(
    'reviews/cycles/archive',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await cycleService.archive(id);
            await dispatch(fetchCycles());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to archive cycle');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    cycles: [],
    activeCycle: null,
    upcomingCycles: [],
    myCycles: [],
    currentCycle: null,
    progress: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const cycleSlice = createSlice({
    name: 'reviewsCycles',
    initialState,
    reducers: {
        clearCycleError: (state) => {
            state.error = null;
        },
        setCurrentCycle: (state, action) => {
            state.currentCycle = action.payload;
        },
        clearCycleState: (state) => {
            state.cycles = [];
            state.activeCycle = null;
            state.upcomingCycles = [];
            state.myCycles = [];
            state.currentCycle = null;
            state.progress = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cycles
            .addCase(fetchCycles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCycles.fulfilled, (state, action) => {
                state.loading = false;
                state.cycles = action.payload;
            })
            .addCase(fetchCycles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch active cycle
            .addCase(fetchActiveCycle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveCycle.fulfilled, (state, action) => {
                state.loading = false;
                state.activeCycle = action.payload;
            })
            .addCase(fetchActiveCycle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch upcoming cycles
            .addCase(fetchUpcomingCycles.fulfilled, (state, action) => {
                state.upcomingCycles = action.payload;
            })
            // Fetch my cycles
            .addCase(fetchMyCycles.fulfilled, (state, action) => {
                state.myCycles = action.payload;
            })
            // Get cycle by ID
            .addCase(getCycleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCycleById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCycle = action.payload;
            })
            .addCase(getCycleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch cycle progress
            .addCase(fetchCycleProgress.fulfilled, (state, action) => {
                state.progress = action.payload;
            });
    },
});

export const { clearCycleError, setCurrentCycle, clearCycleState } = cycleSlice.actions;
export default cycleSlice.reducer;