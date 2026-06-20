/**
 * Bulk Slice - Bulk upload operations
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bulkService } from '../../../services/kpi';

// ============ Async Thunks ============

export const uploadKPIs = createAsyncThunk(
  'bulk/uploadKPIs',
  async ({ file, frameworkId, dryRun = false }, { rejectWithValue }) => {
    try {
      const response = await bulkService.uploadKPIs(file, frameworkId, dryRun);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadActuals = createAsyncThunk(
  'bulk/uploadActuals',
  async ({ file, year, month, dryRun = false }, { rejectWithValue }) => {
    try {
      const response = await bulkService.uploadActuals(file, year, month, dryRun);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadTargets = createAsyncThunk(
  'bulk/uploadTargets',
  async ({ file, year, dryRun = false }, { rejectWithValue }) => {
    try {
      const response = await bulkService.uploadTargets(file, year, dryRun);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const downloadTemplate = createAsyncThunk(
  'bulk/downloadTemplate',
  async (type, { rejectWithValue }) => {
    try {
      const response = await bulkService.downloadTemplate(type);
      return { type, blob: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Initial State ============
const initialState = {
  uploadResult: null,
  templateBlob: null,
  
  uploading: false,
  downloading: false,
  uploadProgress: 0,
  error: null,
  
  lastUpload: null,
};

// ============ Slice ============
const bulkSlice = createSlice({
  name: 'bulk',
  initialState,
  reducers: {
    clearUploadResult: (state) => {
      state.uploadResult = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.uploadProgress = 0;
      state.uploadResult = null;
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload KPIs
      .addCase(uploadKPIs.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadKPIs.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadResult = action.payload;
        state.lastUpload = new Date().toISOString();
      })
      .addCase(uploadKPIs.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      
      // Upload Actuals
      .addCase(uploadActuals.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadActuals.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadResult = action.payload;
        state.lastUpload = new Date().toISOString();
      })
      .addCase(uploadActuals.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      
      // Upload Targets
      .addCase(uploadTargets.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadTargets.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadResult = action.payload;
        state.lastUpload = new Date().toISOString();
      })
      .addCase(uploadTargets.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      
      // Download Template
      .addCase(downloadTemplate.pending, (state) => {
        state.downloading = true;
      })
      .addCase(downloadTemplate.fulfilled, (state, action) => {
        state.downloading = false;
        state.templateBlob = action.payload;
      })
      .addCase(downloadTemplate.rejected, (state) => {
        state.downloading = false;
      });
  },
});

export const { clearUploadResult, setUploadProgress, resetUploadState, clearErrors } = bulkSlice.actions;
export default bulkSlice.reducer;