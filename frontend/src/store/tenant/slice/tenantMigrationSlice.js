// frontend/src/store/tenant/slice/tenantMigrationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MigrationService } from '../../../services/tenant';

export const fetchMigrations = createAsyncThunk(
    'tenantMigration/fetchMigrations',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await MigrationService.getMigrations(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const runMigrations = createAsyncThunk(
    'tenantMigration/runMigrations',
    async ({ tenantId, appName }, { rejectWithValue }) => {
        try {
            const response = await MigrationService.runMigrations(tenantId, appName);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    migrations: [],
    summary: { total: 0, pending: 0, completed: 0, failed: 0 },
    loading: false,
    error: null,
    running: false,
};

const tenantMigrationSlice = createSlice({
    name: 'tenantMigration',
    initialState,
    reducers: {
        clearMigrationError: (state) => {
            state.error = null;
        },
        setRunning: (state, action) => {
            state.running = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMigrations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMigrations.fulfilled, (state, action) => {
                state.loading = false;
                state.migrations = action.payload.results || action.payload;
                state.summary = {
                    total: action.payload.total || action.payload.length,
                    pending: action.payload.pending_count || 0,
                    completed: action.payload.completed_count || 0,
                    failed: action.payload.failed_count || 0,
                };
            })
            .addCase(fetchMigrations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(runMigrations.pending, (state) => {
                state.running = true;
            })
            .addCase(runMigrations.fulfilled, (state) => {
                state.running = false;
            })
            .addCase(runMigrations.rejected, (state, action) => {
                state.running = false;
                state.error = action.payload;
            });
    },
});

export const { clearMigrationError, setRunning } = tenantMigrationSlice.actions;
export default tenantMigrationSlice.reducer;