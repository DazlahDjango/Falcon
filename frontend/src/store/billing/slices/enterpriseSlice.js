import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EnterpriseService } from '../../../services/billing';

export const fetchOverrides = createAsyncThunk('billing/enterprise/fetchOverrides', async ({ page = 1, pageSize = 20 } = {}, { rejectWithValue }) => {
    try { const response = await EnterpriseService.getOverrides({ page, page_size: pageSize }); return { items: response?.data || [], total: response?.count || 0, page, pageSize }; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch overrides'); }
});

export const createOverride = createAsyncThunk('billing/enterprise/createOverride', async (overrideData, { rejectWithValue, dispatch }) => {
    try { const response = await EnterpriseService.createOverride(overrideData); await dispatch(fetchOverrides({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to create override'); }
});

export const updateOverride = createAsyncThunk('billing/enterprise/updateOverride', async ({ id, data }, { rejectWithValue, dispatch }) => {
    try { const response = await EnterpriseService.updateOverride(id, data); await dispatch(fetchOverrides({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to update override'); }
});

export const deleteOverride = createAsyncThunk('billing/enterprise/deleteOverride', async (id, { rejectWithValue, dispatch }) => {
    try { await EnterpriseService.deleteOverride(id); await dispatch(fetchOverrides({})); return id; }
    catch (error) { return rejectWithValue(error.message || 'Failed to delete override'); }
});

export const fetchActiveOverride = createAsyncThunk('billing/enterprise/fetchActive', async (tenantId, { rejectWithValue }) => {
    try { const response = await EnterpriseService.getActiveOverride(tenantId); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch active override'); }
});

export const expireOverrides = createAsyncThunk('billing/enterprise/expireOverrides', async (_, { rejectWithValue, dispatch }) => {
    try { const response = await EnterpriseService.expireOverrides(); await dispatch(fetchOverrides({})); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to expire overrides'); }
});

export const createDynamicPlan = createAsyncThunk('billing/enterprise/createDynamicPlan', async (planData, { rejectWithValue }) => {
    try { const response = await EnterpriseService.createDynamicPlan(planData); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to create dynamic plan'); }
});

export const updateDynamicPlan = createAsyncThunk('billing/enterprise/updateDynamicPlan', async ({ id, planData }, { rejectWithValue }) => {
    try { const response = await EnterpriseService.updateDynamicPlan(id, planData); return response?.data; }
    catch (error) { return rejectWithValue(error.message || 'Failed to update dynamic plan'); }
});

export const fetchDynamicPlans = createAsyncThunk('billing/enterprise/fetchDynamicPlans', async (_, { rejectWithValue }) => {
    try { const response = await EnterpriseService.getAllDynamicPlans(); return response?.data || []; }
    catch (error) { return rejectWithValue(error.message || 'Failed to fetch dynamic plans'); }
});

const initialState = {
    overrides: [], dynamicPlans: [], activeOverride: null, pagination: { page: 1, pageSize: 20, total: 0 }, loading: false, error: null,
};

const enterpriseSlice = createSlice({
    name: 'billing/enterprise', initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        clearActiveOverride: (state) => { state.activeOverride = null; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOverrides.pending, (state) => { state.loading = true; });
        builder.addCase(fetchOverrides.fulfilled, (state, action) => { state.loading = false; state.overrides = action.payload.items; state.pagination = { page: action.payload.page, pageSize: action.payload.pageSize, total: action.payload.total }; });
        builder.addCase(fetchOverrides.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
        builder.addCase(fetchActiveOverride.fulfilled, (state, action) => { state.activeOverride = action.payload; });
        builder.addCase(fetchDynamicPlans.fulfilled, (state, action) => { state.dynamicPlans = action.payload; });
        builder.addCase(createDynamicPlan.fulfilled, (state, action) => { if (action.payload) state.dynamicPlans.unshift(action.payload); });
        builder.addCase(updateDynamicPlan.fulfilled, (state, action) => { if (action.payload) { const index = state.dynamicPlans.findIndex(p => p.id === action.payload.id); if (index !== -1) state.dynamicPlans[index] = action.payload; } });
    },
});

export const { clearError, clearActiveOverride } = enterpriseSlice.actions;
export default enterpriseSlice.reducer;