// frontend/src/store/tenant/slice/tenantSchemaSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SchemaService } from '../../../services/tenant';

export const fetchSchema = createAsyncThunk(
    'tenantSchema/fetchSchema',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await SchemaService.getSchemaForTenant(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSchemaTables = createAsyncThunk(
    'tenantSchema/fetchSchemaTables',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await SchemaService.getSchemaTables(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const refreshSchemaStats = createAsyncThunk(
    'tenantSchema/refreshSchemaStats',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await SchemaService.refreshSchemaStats(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    schema: null,
    tables: [],
    loading: false,
    error: null,
    refreshing: false,
};

const tenantSchemaSlice = createSlice({
    name: 'tenantSchema',
    initialState,
    reducers: {
        clearSchemaError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchema.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSchema.fulfilled, (state, action) => {
                state.loading = false;
                state.schema = action.payload;
            })
            .addCase(fetchSchema.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSchemaTables.fulfilled, (state, action) => {
                state.tables = action.payload;
            })
            .addCase(refreshSchemaStats.pending, (state) => {
                state.refreshing = true;
            })
            .addCase(refreshSchemaStats.fulfilled, (state, action) => {
                state.refreshing = false;
                if (action.payload) {
                    state.schema = { ...state.schema, ...action.payload };
                }
            })
            .addCase(refreshSchemaStats.rejected, (state) => {
                state.refreshing = false;
            });
    },
});

export const { clearSchemaError } = tenantSchemaSlice.actions;
export default tenantSchemaSlice.reducer;