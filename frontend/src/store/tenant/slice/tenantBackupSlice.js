// frontend/src/store/tenant/slice/tenantBackupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BackupService } from '../../../services/tenant';

// Async Thunks
export const fetchBackups = createAsyncThunk(
    'tenantBackup/fetchBackups',
    async (tenantId, { rejectWithValue }) => {
        try {
            const response = await BackupService.getBackups(tenantId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createBackup = createAsyncThunk(
    'tenantBackup/createBackup',
    async ({ tenantId, backupType }, { rejectWithValue }) => {
        try {
            const response = await BackupService.createBackupForTenant(tenantId, backupType);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBackup = createAsyncThunk(
    'tenantBackup/deleteBackup',
    async ({ tenantId, backupId }, { rejectWithValue }) => {
        try {
            await BackupService.deleteBackupForTenant(tenantId, backupId);
            return backupId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const restoreBackup = createAsyncThunk(
    'tenantBackup/restoreBackup',
    async ({ tenantId, backupId }, { rejectWithValue }) => {
        try {
            const response = await BackupService.restoreBackupForTenant(tenantId, backupId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State
const initialState = {
    backups: [],
    loading: false,
    error: null,
    creatingBackup: false,
    restoringBackup: false,
};

// Slice
const tenantBackupSlice = createSlice({
    name: 'tenantBackup',
    initialState,
    reducers: {
        clearBackupError: (state) => {
            state.error = null;
        },
        setCreatingBackup: (state, action) => {
            state.creatingBackup = action.payload;
        },
        setRestoringBackup: (state, action) => {
            state.restoringBackup = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Backups
            .addCase(fetchBackups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBackups.fulfilled, (state, action) => {
                state.loading = false;
                state.backups = action.payload.results || action.payload;
            })
            .addCase(fetchBackups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Backup
            .addCase(createBackup.pending, (state) => {
                state.creatingBackup = true;
            })
            .addCase(createBackup.fulfilled, (state, action) => {
                state.creatingBackup = false;
                state.backups.unshift(action.payload);
            })
            .addCase(createBackup.rejected, (state, action) => {
                state.creatingBackup = false;
                state.error = action.payload;
            })
            // Delete Backup
            .addCase(deleteBackup.fulfilled, (state, action) => {
                state.backups = state.backups.filter(b => b.id !== action.payload);
            })
            // Restore Backup
            .addCase(restoreBackup.pending, (state) => {
                state.restoringBackup = true;
            })
            .addCase(restoreBackup.fulfilled, (state) => {
                state.restoringBackup = false;
            })
            .addCase(restoreBackup.rejected, (state, action) => {
                state.restoringBackup = false;
                state.error = action.payload;
            });
    },
});

export const { clearBackupError, setCreatingBackup, setRestoringBackup } = tenantBackupSlice.actions;
export default tenantBackupSlice.reducer;