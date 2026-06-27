import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as mfaApi from '../../../services/accounts/api/mfa';

const initialState = {
  devices: [],
  selectedDevice: null,
  backupCodes: [],
  backupCodesStatus: null,
  mfaStatus: null,
  mfaActivity: [],
  mfaFailureRate: null,
  auditLogs: [],
  auditSummary: null,
  isLoading: false,
  isSettingUp: false,
  isVerifying: false,
  isGenerating: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  filters: {
    device_type: '',
    is_active: null,
    is_verified: null,
  },
};

export const fetchMFADevices = createAsyncThunk(
  'mfa/fetchDevices',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const pagination = state.mfa.pagination;
      const filters = state.mfa.filters;
      const queryParams = {
        page: params?.page || pagination.page,
        page_size: params?.pageSize || pagination.pageSize,
        ...filters,
        ...params,
      };
      const response = await mfaApi.getMFADevices(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA devices');
    }
  }
);

export const fetchMFADevice = createAsyncThunk(
  'mfa/fetchDevice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFADevice(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA device');
    }
  }
);

export const createMFADevice = createAsyncThunk(
  'mfa/createDevice',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mfaApi.createMFADevice(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create MFA device');
    }
  }
);

export const updateMFADevice = createAsyncThunk(
  'mfa/updateDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await mfaApi.updateMFADevice(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update MFA device');
    }
  }
);

export const deleteMFADevice = createAsyncThunk(
  'mfa/deleteDevice',
  async (id, { rejectWithValue }) => {
    try {
      await mfaApi.deleteMFADevice(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete MFA device');
    }
  }
);

export const setupTOTP = createAsyncThunk(
  'mfa/setupTOTP',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mfaApi.setupTOTP(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to setup TOTP');
    }
  }
);

export const verifyTOTPSetup = createAsyncThunk(
  'mfa/verifyTOTPSetup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mfaApi.verifyTOTPSetup(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to verify TOTP setup');
    }
  }
);

export const verifyDevice = createAsyncThunk(
  'mfa/verifyDevice',
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      const response = await mfaApi.verifyDevice(id, { otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to verify device');
    }
  }
);

export const verifyBackupCode = createAsyncThunk(
  'mfa/verifyBackupCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await mfaApi.verifyBackupCode({ code });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Invalid backup code');
    }
  }
);

export const generateBackupCodes = createAsyncThunk(
  'mfa/generateBackupCodes',
  async (count = 10, { rejectWithValue }) => {
    try {
      const response = await mfaApi.generateBackupCodes({ count });
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
      const response = await mfaApi.getBackupCodesStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch backup codes status');
    }
  }
);

export const setPrimaryDevice = createAsyncThunk(
  'mfa/setPrimaryDevice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mfaApi.setPrimaryDevice(id, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to set primary device');
    }
  }
);

export const disableMFA = createAsyncThunk(
  'mfa/disableMFA',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mfaApi.disableMFA(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to disable MFA');
    }
  }
);

export const fetchMFAStatus = createAsyncThunk(
  'mfa/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFAStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA status');
    }
  }
);

export const fetchMFAActivity = createAsyncThunk(
  'mfa/fetchActivity',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFAActivity(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA activity');
    }
  }
);

export const fetchMFAFailureRate = createAsyncThunk(
  'mfa/fetchFailureRate',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFAFailureRate(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch failure rate');
    }
  }
);

export const fetchMFAAuditLogs = createAsyncThunk(
  'mfa/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFAAuditLogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch MFA audit logs');
    }
  }
);

export const fetchMFAAuditSummary = createAsyncThunk(
  'mfa/fetchAuditSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mfaApi.getMFAAuditSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit summary');
    }
  }
);

const mfaSlice = createSlice({
  name: 'mfa',
  initialState,
  reducers: {
    clearMfaError: (state) => {
      state.error = null;
    },
    setMfaFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setMfaPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedDevice: (state) => {
      state.selectedDevice = null;
    },
    clearBackupCodes: (state) => {
      state.backupCodes = [];
    },
    resetMfa: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMFADevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMFADevices.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.devices = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchMFADevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMFADevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMFADevice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDevice = action.payload;
      })
      .addCase(fetchMFADevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createMFADevice.fulfilled, (state, action) => {
        state.devices.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(updateMFADevice.fulfilled, (state, action) => {
        const index = state.devices.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.devices[index] = { ...state.devices[index], ...action.payload };
        }
        if (state.selectedDevice?.id === action.payload.id) {
          state.selectedDevice = { ...state.selectedDevice, ...action.payload };
        }
      })
      .addCase(deleteMFADevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedDevice?.id === action.payload) {
          state.selectedDevice = null;
        }
      })
      .addCase(setupTOTP.pending, (state) => {
        state.isSettingUp = true;
        state.error = null;
      })
      .addCase(setupTOTP.fulfilled, (state, action) => {
        state.isSettingUp = false;
        state.backupCodes = action.payload.backup_codes || [];
      })
      .addCase(setupTOTP.rejected, (state, action) => {
        state.isSettingUp = false;
        state.error = action.payload;
      })
      .addCase(verifyTOTPSetup.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyTOTPSetup.fulfilled, (state) => {
        state.isVerifying = false;
      })
      .addCase(verifyTOTPSetup.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload;
      })
      .addCase(generateBackupCodes.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateBackupCodes.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.backupCodes = action.payload.codes || action.payload.backup_codes || [];
      })
      .addCase(generateBackupCodes.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })
      .addCase(fetchBackupCodesStatus.fulfilled, (state, action) => {
        state.backupCodesStatus = action.payload;
      })
      .addCase(setPrimaryDevice.fulfilled, (state, action) => {
        state.devices = state.devices.map(d => ({
          ...d,
          is_primary: d.id === action.payload.device_id,
        }));
        if (state.selectedDevice) {
          state.selectedDevice.is_primary = state.selectedDevice.id === action.payload.device_id;
        }
      })
      .addCase(disableMFA.fulfilled, (state) => {
        state.devices = [];
        state.mfaStatus = null;
      })
      .addCase(fetchMFAStatus.fulfilled, (state, action) => {
        state.mfaStatus = action.payload;
      })
      .addCase(fetchMFAActivity.fulfilled, (state, action) => {
        state.mfaActivity = action.payload.activity || action.payload || [];
      })
      .addCase(fetchMFAFailureRate.fulfilled, (state, action) => {
        state.mfaFailureRate = action.payload;
      })
      .addCase(fetchMFAAuditLogs.fulfilled, (state, action) => {
        const data = action.payload;
        state.auditLogs = data.results || data.data || data || [];
        state.pagination.total = data.count || data.total || 0;
      })
      .addCase(fetchMFAAuditSummary.fulfilled, (state, action) => {
        state.auditSummary = action.payload;
      });
  },
});

export const {
  clearMfaError,
  setMfaFilters,
  setMfaPage,
  clearSelectedDevice,
  clearBackupCodes,
  resetMfa,
} = mfaSlice.actions;

export default mfaSlice.reducer;