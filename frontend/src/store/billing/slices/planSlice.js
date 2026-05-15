import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PlanService } from '../../../services/billing';
import { PLAN_TYPES, BILLING_INTERVALS } from '../../../config/constants/billingConstants';

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchPlans = createAsyncThunk(
    'billing/plans/fetchPlans',
    async ({ planType = null, billingInterval = BILLING_INTERVALS.MONTHLY, excludeTrial = true } = {}, { rejectWithValue }) => {
        try {
            const params = {};
            if (planType) params.plan_type = planType;
            if (billingInterval) params.billing_interval = billingInterval;
            if (excludeTrial) params.exclude_trial = true;
            
            const response = await PlanService.getPlans(params);
            return response?.data || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch plans');
        }
    }
);

export const fetchPlanById = createAsyncThunk(
    'billing/plans/fetchPlanById',
    async (planId, { rejectWithValue }) => {
        try {
            const response = await PlanService.getPlan(planId);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch plan');
        }
    }
);

export const fetchPopularPlan = createAsyncThunk(
    'billing/plans/fetchPopularPlan',
    async (_, { rejectWithValue }) => {
        try {
            const response = await PlanService.getPopularPlan();
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch popular plan');
        }
    }
);

export const comparePlans = createAsyncThunk(
    'billing/plans/comparePlans',
    async (planIds, { rejectWithValue }) => {
        try {
            const response = await PlanService.comparePlans(planIds);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to compare plans');
        }
    }
);

// Admin actions
export const createPlan = createAsyncThunk(
    'billing/plans/createPlan',
    async (planData, { rejectWithValue }) => {
        try {
            const response = await PlanService.createPlan(planData);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create plan');
        }
    }
);

export const updatePlan = createAsyncThunk(
    'billing/plans/updatePlan',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await PlanService.updatePlan(id, data);
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update plan');
        }
    }
);

export const deletePlan = createAsyncThunk(
    'billing/plans/deletePlan',
    async (id, { rejectWithValue }) => {
        try {
            await PlanService.deletePlan(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete plan');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    items: [],
    selectedPlan: null,
    popularPlan: null,
    comparison: null,
    loading: false,
    error: null,
    filters: {
        planType: null,
        billingInterval: BILLING_INTERVALS.MONTHLY,
        excludeTrial: true,
    },
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    lastFetched: null,
};

// ============================================================================
// Slice
// ============================================================================

const planSlice = createSlice({
    name: 'billing/plans',
    initialState,
    reducers: {
        setSelectedPlan: (state, action) => {
            state.selectedPlan = action.payload;
        },
        clearSelectedPlan: (state) => {
            state.selectedPlan = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearPlans: (state) => {
            state.items = [];
            state.selectedPlan = null;
            state.popularPlan = null;
            state.comparison = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Plans
        builder.addCase(fetchPlans.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPlans.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchPlans.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Plan By ID
        builder.addCase(fetchPlanById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPlanById.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedPlan = action.payload;
        });
        builder.addCase(fetchPlanById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Popular Plan
        builder.addCase(fetchPopularPlan.fulfilled, (state, action) => {
            state.popularPlan = action.payload;
        });

        // Compare Plans
        builder.addCase(comparePlans.fulfilled, (state, action) => {
            state.comparison = action.payload;
        });

        // Create Plan
        builder.addCase(createPlan.fulfilled, (state, action) => {
            state.items.push(action.payload);
        });

        // Update Plan
        builder.addCase(updatePlan.fulfilled, (state, action) => {
            const index = state.items.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.selectedPlan?.id === action.payload.id) {
                state.selectedPlan = action.payload;
            }
        });

        // Delete Plan
        builder.addCase(deletePlan.fulfilled, (state, action) => {
            state.items = state.items.filter(p => p.id !== action.payload);
            if (state.selectedPlan?.id === action.payload) {
                state.selectedPlan = null;
            }
        });
    },
});

// ============================================================================
// Exports
// ============================================================================

export const {
    setSelectedPlan,
    clearSelectedPlan,
    setFilters,
    clearFilters,
    setPagination,
    clearPlans,
    clearError,
} = planSlice.actions;

export default planSlice.reducer;