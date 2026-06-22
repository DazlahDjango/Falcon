import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as mfaService from '../../../services/accounts/api/mfa';

export const fetchMfaDevices = createAsyncThunk(
    'mfa/fetchDevices',
    async (_, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaDevices();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA devices');
        }
    }
);

export const fetchMfaDevice = createAsyncThunk(
    'mfa/fetchDevice',
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaDevice(deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA device');
        }
    }
);

export const createMfaDevice = createAsyncThunk(
    'mfa/createDevice',
    async (data, { rejectWithValue }) => {
        try {
            const response = await mfaService.createMfaDevice(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create MFA device');
        }
    }
);

export const updateMfaDevice = createAsyncThunk(
    'mfa/updateDevice',
    async ({ deviceId, data }, { rejectWithValue }) => {
        try {
            const response = await mfaService.updateMfaDevice(deviceId, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update MFA device');
        }
    }
);

export const deleteMfaDevice = createAsyncThunk(
    'mfa/deleteDevice',
    async (deviceId, { rejectWithValue }) => {
        try {
            await mfaService.deleteMfaDevice(deviceId);
            return deviceId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete MFA device');
        }
    }
);

export const setPrimaryDevice = createAsyncThunk(
    'mfa/setPrimary',
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await mfaService.setPrimaryDevice(deviceId);
            return { deviceId, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to set primary device');
        }
    }
);

// TOTP Setup
export const setupTotp = createAsyncThunk(
    'mfa/setupTotp',
    async (deviceName = 'Authenticator', { rejectWithValue }) => {
        try {
            const response = await mfaService.setupTotp(deviceName);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to setup TOTP');
        }
    }
);

export const verifyTotpSetup = createAsyncThunk(
    'mfa/verifyTotpSetup',
    async ({ otp, deviceId }, { rejectWithValue }) => {
        try {
            const response = await mfaService.verifyTotpSetup(otp, deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to verify TOTP setup');
        }
    }
);

// Backup Codes
export const generateBackupCodes = createAsyncThunk(
    'mfa/generateBackupCodes',
    async (count = 10, { rejectWithValue }) => {
        try {
            const response = await mfaService.generateBackupCodes(count);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to generate backup codes');
        }
    }
);

export const fetchBackupCodesStatus = createAsyncThunk(
    'mfa/fetchBackupCodesStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await mfaService.getBackupCodesStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch backup codes status');
        }
    }
);

// MFA Status
export const fetchMfaStatus = createAsyncThunk(
    'mfa/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA status');
        }
    }
);

export const fetchMfaActivity = createAsyncThunk(
    'mfa/fetchActivity',
    async (hours = 24, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaActivity(hours);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA activity');
        }
    }
);

export const fetchMfaFailureRate = createAsyncThunk(
    'mfa/fetchFailureRate',
    async (hours = 24, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaFailureRate(hours);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch failure rate');
        }
    }
);

// Disable MFA
export const disableMfa = createAsyncThunk(
    'mfa/disableMfa',
    async (deviceId = null, { rejectWithValue }) => {
        try {
            const response = await mfaService.disableMfa(deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to disable MFA');
        }
    }
);

// Audit Logs
export const fetchMfaAuditLogs = createAsyncThunk(
    'mfa/fetchAuditLogs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaAuditLogs(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs');
        }
    }
);

export const fetchMfaAuditLogSummary = createAsyncThunk(
    'mfa/fetchAuditLogSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await mfaService.getMfaAuditLogSummary();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit summary');
        }
    }
);

// Admin Routes
export const fetchUserMfaDevices = createAsyncThunk(
    'mfa/fetchUserDevices',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await mfaService.getUserMfaDevices(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch user MFA devices');
        }
    }
);

export const setupUserTotp = createAsyncThunk(
    'mfa/setupUserTotp',
    async ({ userId, deviceName = 'Authenticator' }, { rejectWithValue }) => {
        try {
            const response = await mfaService.setupUserTotp(userId, deviceName);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to setup user TOTP');
        }
    }
);

export const disableUserMfa = createAsyncThunk(
    'mfa/disableUserMfa',
    async ({ userId, deviceId = null }, { rejectWithValue }) => {
        try {
            const response = await mfaService.disableUserMfa(userId, deviceId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to disable user MFA');
        }
    }
);

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    // Devices
    devices: [],
    currentDevice: null,
    devicesLoading: false,
    devicesError: null,

    // TOTP Setup
    totpSetup: null,
    totpSetupLoading: false,
    totpSetupError: null,

    // Backup Codes
    backupCodes: [],
    backupCodesRemaining: 0,
    backupCodesLoading: false,
    backupCodesError: null,

    // MFA Status
    status: null,
    statusLoading: false,
    statusError: null,

    // Activity & Analytics
    activity: [],
    failureRate: null,

    // Audit Logs
    auditLogs: [],
    auditLogSummary: null,
    auditLogsLoading: false,
    auditLogsError: null,

    // Admin (when viewing other users)
    userDevices: [],
    userDevicesLoading: false,

    // UI State
    isMfaEnabled: false,
};

// ============================================================================
// Slice
// ============================================================================

const mfaSlice = createSlice({
    name: 'mfa',
    initialState,
    reducers: {
        clearMfaErrors: (state) => {
            state.devicesError = null;
            state.totpSetupError = null;
            state.backupCodesError = null;
            state.statusError = null;
            state.auditLogsError = null;
        },
        clearTotpSetup: (state) => {
            state.totpSetup = null;
            state.totpSetupError = null;
        },
        clearBackupCodes: (state) => {
            state.backupCodes = [];
        },
        resetMfaState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // ========== Fetch Devices ==========
            .addCase(fetchMfaDevices.pending, (state) => {
                state.devicesLoading = true;
                state.devicesError = null;
            })
            .addCase(fetchMfaDevices.fulfilled, (state, action) => {
                state.devicesLoading = false;
                state.devices = action.payload.results || action.payload;
                state.isMfaEnabled = state.devices.some(d => d.is_active && d.is_verified);
            })
            .addCase(fetchMfaDevices.rejected, (state, action) => {
                state.devicesLoading = false;
                state.devicesError = action.payload;
            })

            // ========== Setup TOTP ==========
            .addCase(setupTotp.pending, (state) => {
                state.totpSetupLoading = true;
                state.totpSetupError = null;
            })
            .addCase(setupTotp.fulfilled, (state, action) => {
                state.totpSetupLoading = false;
                state.totpSetup = action.payload;
            })
            .addCase(setupTotp.rejected, (state, action) => {
                state.totpSetupLoading = false;
                state.totpSetupError = action.payload;
            })

            // ========== Verify TOTP Setup ==========
            .addCase(verifyTotpSetup.pending, (state) => {
                state.totpSetupLoading = true;
            })
            .addCase(verifyTotpSetup.fulfilled, (state, action) => {
                state.totpSetupLoading = false;
                state.totpSetup = null;
                if (action.payload?.backup_codes || action.payload?.codes) {
                    state.backupCodes = action.payload.backup_codes || action.payload.codes;
                    state.backupCodesRemaining = state.backupCodes.length;
                }
            })
            .addCase(verifyTotpSetup.rejected, (state, action) => {
                state.totpSetupLoading = false;
                state.totpSetupError = action.payload;
            })

            // ========== Delete Device ==========
            .addCase(deleteMfaDevice.fulfilled, (state, action) => {
                state.devices = state.devices.filter(d => d.id !== action.payload);
                state.isMfaEnabled = state.devices.some(d => d.is_active && d.is_verified);
            })

            // ========== Set Primary Device ==========
            .addCase(setPrimaryDevice.fulfilled, (state, action) => {
                state.devices = state.devices.map(device => ({
                    ...device,
                    is_primary: device.id === action.payload.deviceId
                }));
            })

            // ========== Generate Backup Codes ==========
            .addCase(generateBackupCodes.pending, (state) => {
                state.backupCodesLoading = true;
            })
            .addCase(generateBackupCodes.fulfilled, (state, action) => {
                state.backupCodesLoading = false;
                state.backupCodes = action.payload.data?.codes || action.payload.codes || [];
                state.backupCodesRemaining = state.backupCodes.length;
            })
            .addCase(generateBackupCodes.rejected, (state, action) => {
                state.backupCodesLoading = false;
                state.backupCodesError = action.payload;
            })

            // ========== Fetch Backup Codes Status ==========
            .addCase(fetchBackupCodesStatus.fulfilled, (state, action) => {
                state.backupCodesRemaining = action.payload.remaining || 0;
            })

            // ========== Fetch MFA Status ==========
            .addCase(fetchMfaStatus.pending, (state) => {
                state.statusLoading = true;
            })
            .addCase(fetchMfaStatus.fulfilled, (state, action) => {
                state.statusLoading = false;
                state.status = action.payload;
                state.isMfaEnabled = action.payload.enabled;
                state.backupCodesRemaining = action.payload.backup_codes_remaining;
            })
            .addCase(fetchMfaStatus.rejected, (state, action) => {
                state.statusLoading = false;
                state.statusError = action.payload;
            })

            // ========== Fetch Activity ==========
            .addCase(fetchMfaActivity.fulfilled, (state, action) => {
                state.activity = action.payload.activity || [];
            })

            // ========== Fetch Failure Rate ==========
            .addCase(fetchMfaFailureRate.fulfilled, (state, action) => {
                state.failureRate = action.payload;
            })

            // ========== Disable MFA ==========
            .addCase(disableMfa.fulfilled, (state) => {
                state.isMfaEnabled = false;
                state.devices = [];
                state.status = null;
            })

            // ========== Fetch Audit Logs ==========
            .addCase(fetchMfaAuditLogs.pending, (state) => {
                state.auditLogsLoading = true;
            })
            .addCase(fetchMfaAuditLogs.fulfilled, (state, action) => {
                state.auditLogsLoading = false;
                state.auditLogs = action.payload.results || action.payload;
            })
            .addCase(fetchMfaAuditLogs.rejected, (state, action) => {
                state.auditLogsLoading = false;
                state.auditLogsError = action.payload;
            })

            // ========== Fetch Audit Log Summary ==========
            .addCase(fetchMfaAuditLogSummary.fulfilled, (state, action) => {
                state.auditLogSummary = action.payload;
            })

            // ========== Admin: Fetch User Devices ==========
            .addCase(fetchUserMfaDevices.pending, (state) => {
                state.userDevicesLoading = true;
            })
            .addCase(fetchUserMfaDevices.fulfilled, (state, action) => {
                state.userDevicesLoading = false;
                state.userDevices = action.payload.results || action.payload;
            })
            .addCase(fetchUserMfaDevices.rejected, (state, action) => {
                state.userDevicesLoading = false;
                state.devicesError = action.payload;
            });
    },
});

// ============================================================================
// Actions & Selectors
// ============================================================================

export const {
    clearMfaErrors,
    clearTotpSetup,
    clearBackupCodes,
    resetMfaState
} = mfaSlice.actions;

// Selectors
export const selectMfa = (state) => state.mfa;
export const selectMfaDevices = (state) => state.mfa.devices;
export const selectMfaStatus = (state) => state.mfa.status;
export const selectMfaTotpSetup = (state) => state.mfa.totpSetup;
export const selectMfaBackupCodes = (state) => state.mfa.backupCodes;
export const selectMfaBackupCodesRemaining = (state) => state.mfa.backupCodesRemaining;
export const selectMfaIsEnabled = (state) => state.mfa.isMfaEnabled;
export const selectMfaActivity = (state) => state.mfa.activity;
export const selectMfaAuditLogs = (state) => state.mfa.auditLogs;
export const selectMfaAuditLogSummary = (state) => state.mfa.auditLogSummary;

export default mfaSlice.reducer;