import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PlanService } from '../../../services/billing';

export const fetchPlans = createAsyncThunk('billing/plans/fetchAll', async ({ params = {} } = {}, { rejectWithValue }) => {
    try { const response = await PlanService.getPlans(params); return response?.data || []; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch plans'); }
});

export const fetchPublicPlans = createAsyncThunk('billing/plans/fetchPublic', async (_, { rejectWithValue }) => {
    try { const response = await PlanService.getPublicPlans(); return response?.data || []; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch public plans'); }
});

export const fetchPlanComparison = createAsyncThunk('billing/plans/fetchComparison', async (_, { rejectWithValue }) => {
    try { const response = await PlanService.getPlanComparison(); return response?.data || []; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch plan comparison'); }
});

export const fetchPlanById = createAsyncThunk('billing/plans/fetchById', async (id, { rejectWithValue }) => {
    try { const response = await PlanService.getPlan(id); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch plan'); }
});

export const createPlan = createAsyncThunk('billing/plans/create', async (planData, { rejectWithValue, dispatch }) => {
    try { const response = await PlanService.createPlan(planData); await dispatch(fetchPlans({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to create plan'); }
});

export const updatePlan = createAsyncThunk('billing/plans/update', async ({ id, planData }, { rejectWithValue, dispatch }) => {
    try { const response = await PlanService.updatePlan(id, planData); await dispatch(fetchPlans({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to update plan'); }
});

export const deletePlan = createAsyncThunk('billing/plans/delete', async (id, { rejectWithValue, dispatch }) => {
    try { await PlanService.deletePlan(id); await dispatch(fetchPlans({})); return id; }
    catch (error) { return rejectWithValue(error.message || 'Failed to delete plan'); }
});

export const syncPlanToPaystack = createAsyncThunk('billing/plans/syncToPaystack', async (id, { rejectWithValue }) => {
    try { const response = await PlanService.syncToPaystack(id); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to sync plan to Paystack'); }
});

const initialState = {
    items: [], publicPlans: [], comparison: [], selectedPlan: null, loading: false, error: null, syncing: false,
    filters: { planType: null, billingInterval: null, isActive: true }, lastFetched: null,
};

const planSlice = createSlice({
    name: 'billing/plans', initialState,
    reducers: {
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
        clearFilters: (state) => { state.filters = initialState.filters; },
        setSelectedPlan: (state, action) => { state.selectedPlan = action.payload; },
        clearSelectedPlan: (state) => { state.selectedPlan = null; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPlans.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.lastFetched = Date.now(); });
        builder.addCase(fetchPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(fetchPublicPlans.pending, (state) => { state.loading = true; });
        builder.addCase(fetchPublicPlans.fulfilled, (state, action) => { state.loading = false; state.publicPlans = action.payload; });
        builder.addCase(fetchPublicPlans.rejected, (state) => { state.loading = false; });
        builder.addCase(fetchPlanComparison.fulfilled, (state, action) => { state.comparison = action.payload; });
        builder.addCase(fetchPlanById.fulfilled, (state, action) => { state.selectedPlan = action.payload; });
        builder.addCase(createPlan.fulfilled, (state, action) => { if (action.payload) state.selectedPlan = action.payload; });
        builder.addCase(updatePlan.fulfilled, (state, action) => { if (action.payload) state.selectedPlan = action.payload; });
        builder.addCase(deletePlan.fulfilled, (state, action) => { state.items = state.items.filter(p => p.id !== action.payload); if (state.selectedPlan?.id === action.payload) state.selectedPlan = null; });
        builder.addCase(syncPlanToPaystack.pending, (state) => { state.syncing = true; });
        builder.addCase(syncPlanToPaystack.fulfilled, (state) => { state.syncing = false; });
        builder.addCase(syncPlanToPaystack.rejected, (state) => { state.syncing = false; });
    },
});

export const { setFilters, clearFilters, setSelectedPlan, clearSelectedPlan, clearError } = planSlice.actions;
export default planSlice.reducer;