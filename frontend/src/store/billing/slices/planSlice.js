import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { planService } from '../../../services/billing/plan.service';

export const fetchPlans = createAsyncThunk(
    'billing/plans/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await planService.getPlans(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchPublicPlans = createAsyncThunk(
    'billing/plans/fetchPublic',
    async (_, { rejectWithValue }) => {
        try {
            const response = await planService.getPublicPlans();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchPlanById = createAsyncThunk(
    'billing/plans/fetchById',
    async (planId, { rejectWithValue }) => {
        try {
            const response = await planService.getPlanById(planId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchPlanFeatures = createAsyncThunk(
    'billing/plans/fetchFeatures',
    async (planId, { rejectWithValue }) => {
        try {
            const response = await planService.getPlanFeatures(planId);
            return { planId, features: response.data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const comparePlans = createAsyncThunk(
    'billing/plans/compare',
    async (planIds, { rejectWithValue }) => {
        try {
            const response = await planService.comparePlans(planIds);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    plans: [],
    publicPlans: [],
    currentPlan: null,
    selectedPlanId: null,
    planFeatures: {},
    comparison: null,
    isLoading: false,
    isComparing: false,
    error: null,
    lastUpdated: null,
};

const planSlice = createSlice({
    name: 'billingPlans',
    initialState,
    reducers: {
        clearPlanError: (state) => {
            state.error = null;
        },
        selectPlan: (state, action) => {
            state.selectedPlanId = action.payload;
        },
        clearSelectedPlan: (state) => {
            state.selectedPlanId = null;
        },
        clearComparison: (state) => {
            state.comparison = null;
        },
        resetPlans: (state) => {
            state.plans = [];
            state.publicPlans = [];
            state.currentPlan = null;
            state.planFeatures = {};
            state.comparison = null;
            state.selectedPlanId = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all plans
            .addCase(fetchPlans.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plans = action.payload || [];
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch public plans
            .addCase(fetchPublicPlans.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPublicPlans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.publicPlans = action.payload || [];
            })
            .addCase(fetchPublicPlans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch plan by ID
            .addCase(fetchPlanById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPlanById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPlan = action.payload;
            })
            .addCase(fetchPlanById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch plan features
            .addCase(fetchPlanFeatures.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPlanFeatures.fulfilled, (state, action) => {
                state.isLoading = false;
                state.planFeatures[action.payload.planId] = action.payload.features;
            })
            .addCase(fetchPlanFeatures.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Compare plans
            .addCase(comparePlans.pending, (state) => {
                state.isComparing = true;
            })
            .addCase(comparePlans.fulfilled, (state, action) => {
                state.isComparing = false;
                state.comparison = action.payload;
            })
            .addCase(comparePlans.rejected, (state, action) => {
                state.isComparing = false;
                state.error = action.payload;
            });
    },
});
export const { 
    clearPlanError, 
    selectPlan, 
    clearSelectedPlan, 
    clearComparison, 
    resetPlans 
} = planSlice.actions;
export default planSlice.reducer;