// src/store/reviews/slices/pipSlice.js
// Redux slice for PIP state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pipService } from '@/services/reviews';

// ========== Async Thunks ==========

export const fetchPIPs = createAsyncThunk(
    'reviews/pips/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await pipService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PIPs');
        }
    }
);

export const fetchMyPIPs = createAsyncThunk(
    'reviews/pips/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await pipService.getMy();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch my PIPs');
        }
    }
);

export const fetchTeamPIPs = createAsyncThunk(
    'reviews/pips/fetchTeam',
    async (_, { rejectWithValue }) => {
        try {
            const response = await pipService.getTeam();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch team PIPs');
        }
    }
);

export const fetchActivePIPs = createAsyncThunk(
    'reviews/pips/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await pipService.getActive();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch active PIPs');
        }
    }
);

export const fetchOverduePIPs = createAsyncThunk(
    'reviews/pips/fetchOverdue',
    async (_, { rejectWithValue }) => {
        try {
            const response = await pipService.getOverdue();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch overdue PIPs');
        }
    }
);

export const getPIPById = createAsyncThunk(
    'reviews/pips/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await pipService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PIP');
        }
    }
);

export const createPIP = createAsyncThunk(
    'reviews/pips/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await pipService.create(data);
            await dispatch(fetchPIPs());
            await dispatch(fetchActivePIPs());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create PIP');
        }
    }
);

export const updatePIP = createAsyncThunk(
    'reviews/pips/update',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await pipService.update(id, data);
            await dispatch(fetchPIPs());
            await dispatch(fetchTeamPIPs());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update PIP');
        }
    }
);

export const deletePIP = createAsyncThunk(
    'reviews/pips/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await pipService.delete(id);
            await dispatch(fetchPIPs());
            await dispatch(fetchActivePIPs());
            await dispatch(fetchOverduePIPs());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete PIP');
        }
    }
);

export const approvePIP = createAsyncThunk(
    'reviews/pips/approve',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await pipService.approve(id);
            await dispatch(fetchPIPs());
            await dispatch(fetchActivePIPs());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve PIP');
        }
    }
);

export const completePIP = createAsyncThunk(
    'reviews/pips/complete',
    async ({ id, outcome, notes }, { rejectWithValue, dispatch }) => {
        try {
            const response = await pipService.complete(id, outcome, notes);
            await dispatch(fetchPIPs());
            await dispatch(fetchMyPIPs());
            await dispatch(fetchActivePIPs());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to complete PIP');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    pips: [],
    myPIPs: [],
    teamPIPs: [],
    activePIPs: [],
    overduePIPs: [],
    currentPIP: null,
    progress: null,
    loading: false,
    error: null,
};

// ========== Slice ==========
const pipSlice = createSlice({
    name: 'reviewsPIPs',
    initialState,
    reducers: {
        clearPIPError: (state) => {
            state.error = null;
        },
        clearCurrentPIP: (state) => {
            state.currentPIP = null;
        },
        clearPIPState: (state) => {
            state.pips = [];
            state.myPIPs = [];
            state.teamPIPs = [];
            state.activePIPs = [];
            state.overduePIPs = [];
            state.currentPIP = null;
            state.progress = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPIPs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPIPs.fulfilled, (state, action) => {
                state.loading = false;
                state.pips = action.payload;
            })
            .addCase(fetchPIPs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyPIPs.fulfilled, (state, action) => {
                state.myPIPs = action.payload;
            })
            .addCase(fetchTeamPIPs.fulfilled, (state, action) => {
                state.teamPIPs = action.payload;
            })
            .addCase(fetchActivePIPs.fulfilled, (state, action) => {
                state.activePIPs = action.payload;
            })
            .addCase(fetchOverduePIPs.fulfilled, (state, action) => {
                state.overduePIPs = action.payload;
            })
            .addCase(getPIPById.fulfilled, (state, action) => {
                state.currentPIP = action.payload;
            });
    },
});

export const { clearPIPError, clearCurrentPIP, clearPIPState } = pipSlice.actions;
export default pipSlice.reducer;