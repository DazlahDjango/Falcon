// src/store/reviews/slices/analyticsExportSlice.js
// Redux slice for analytics export state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsExportService } from '@/services/reviews';

// ========== Async Thunks ==========

// Export analytics
export const exportAnalytics = createAsyncThunk(
    'reviews/analyticsExport/exportAnalytics',
    async ({ type, format, params = {} }, { rejectWithValue }) => {
        try {
            const blob = await analyticsExportService.exportAnalytics(type, format, params);
            return { blob, type, format, filename: `${type}_analytics.${format}` };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export analytics');
        }
    }
);

// Export report
export const exportReport = createAsyncThunk(
    'reviews/analyticsExport/exportReport',
    async ({ reportType, format, data = {} }, { rejectWithValue }) => {
        try {
            const blob = await analyticsExportService.exportAnalyticsReport(reportType, format, data);
            return { blob, reportType, format, filename: `${reportType}_report.${format}` };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export report');
        }
    }
);

// Export predictions
export const exportPredictions = createAsyncThunk(
    'reviews/analyticsExport/exportPredictions',
    async ({ format, params = {} }, { rejectWithValue }) => {
        try {
            const blob = await analyticsExportService.exportPredictionsAnalytics(format, params);
            return { blob, format, filename: `predictions.${format}` };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export predictions');
        }
    }
);

// Export PIP analytics
export const exportPIPAnalytics = createAsyncThunk(
    'reviews/analyticsExport/exportPIPAnalytics',
    async ({ format, params = {} }, { rejectWithValue }) => {
        try {
            const blob = await analyticsExportService.exportPIPAnalytics(format, params);
            return { blob, format, filename: `pip_analytics.${format}` };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to export PIP analytics');
        }
    }
);

// Get export status
export const getExportStatus = createAsyncThunk(
    'reviews/analyticsExport/getStatus',
    async (exportId, { rejectWithValue }) => {
        try {
            const response = await analyticsExportService.getExportStatus(exportId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to get export status');
        }
    }
);

// Download export
export const downloadExport = createAsyncThunk(
    'reviews/analyticsExport/downloadExport',
    async (exportId, { rejectWithValue }) => {
        try {
            const blob = await analyticsExportService.downloadExport(exportId);
            return { blob, exportId };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to download export');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    exporting: false,
    exportProgress: null,
    exportError: null,
    currentExportId: null,
    exportHistory: [],
    lastExported: null,
    supportedFormats: ['pdf', 'xlsx', 'csv'],
};

// ========== Slice ==========
const analyticsExportSlice = createSlice({
    name: 'reviews/analyticsExport',
    initialState,
    reducers: {
        clearExportErrors: (state) => {
            state.exportError = null;
        },
        clearCurrentExport: (state) => {
            state.currentExportId = null;
            state.exportProgress = null;
        },
        addToExportHistory: (state, action) => {
            state.exportHistory.unshift({
                ...action.payload,
                timestamp: new Date().toISOString(),
            });
            // Keep only last 50 exports
            state.exportHistory = state.exportHistory.slice(0, 50);
        },
        clearExportHistory: (state) => {
            state.exportHistory = [];
        },
        updateExportProgress: (state, action) => {
            state.exportProgress = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== Export Analytics ==========
            .addCase(exportAnalytics.pending, (state) => {
                state.exporting = true;
                state.exportError = null;
                state.exportProgress = 0;
            })
            .addCase(exportAnalytics.fulfilled, (state, action) => {
                state.exporting = false;
                state.lastExported = new Date().toISOString();
                // Trigger download
                analyticsExportService.downloadBlob(action.payload.blob, action.payload.filename);
                state.addToExportHistory({
                    type: 'analytics',
                    format: action.payload.format,
                    filename: action.payload.filename,
                });
            })
            .addCase(exportAnalytics.rejected, (state, action) => {
                state.exporting = false;
                state.exportError = action.payload;
            })
            
            // ========== Export Report ==========
            .addCase(exportReport.pending, (state) => {
                state.exporting = true;
                state.exportError = null;
                state.exportProgress = 0;
            })
            .addCase(exportReport.fulfilled, (state, action) => {
                state.exporting = false;
                state.lastExported = new Date().toISOString();
                analyticsExportService.downloadBlob(action.payload.blob, action.payload.filename);
                state.addToExportHistory({
                    type: 'report',
                    reportType: action.payload.reportType,
                    format: action.payload.format,
                    filename: action.payload.filename,
                });
            })
            .addCase(exportReport.rejected, (state, action) => {
                state.exporting = false;
                state.exportError = action.payload;
            })
            
            // ========== Export Predictions ==========
            .addCase(exportPredictions.pending, (state) => {
                state.exporting = true;
                state.exportError = null;
                state.exportProgress = 0;
            })
            .addCase(exportPredictions.fulfilled, (state, action) => {
                state.exporting = false;
                state.lastExported = new Date().toISOString();
                analyticsExportService.downloadBlob(action.payload.blob, action.payload.filename);
                state.addToExportHistory({
                    type: 'predictions',
                    format: action.payload.format,
                    filename: action.payload.filename,
                });
            })
            .addCase(exportPredictions.rejected, (state, action) => {
                state.exporting = false;
                state.exportError = action.payload;
            })
            
            // ========== Export PIP Analytics ==========
            .addCase(exportPIPAnalytics.pending, (state) => {
                state.exporting = true;
                state.exportError = null;
                state.exportProgress = 0;
            })
            .addCase(exportPIPAnalytics.fulfilled, (state, action) => {
                state.exporting = false;
                state.lastExported = new Date().toISOString();
                analyticsExportService.downloadBlob(action.payload.blob, action.payload.filename);
                state.addToExportHistory({
                    type: 'pip_analytics',
                    format: action.payload.format,
                    filename: action.payload.filename,
                });
            })
            .addCase(exportPIPAnalytics.rejected, (state, action) => {
                state.exporting = false;
                state.exportError = action.payload;
            })
            
            // ========== Get Export Status ==========
            .addCase(getExportStatus.fulfilled, (state, action) => {
                state.exportProgress = action.payload.progress;
                if (action.payload.status === 'completed') {
                    state.currentExportId = action.payload.id;
                }
            });
    },
});

// ========== Actions ==========
export const {
    clearExportErrors,
    clearCurrentExport,
    addToExportHistory,
    clearExportHistory,
    updateExportProgress,
} = analyticsExportSlice.actions;

// ========== Selectors ==========
export const selectExporting = (state) => state.reviewsAnalyticsExport.exporting;
export const selectExportProgress = (state) => state.reviewsAnalyticsExport.exportProgress;
export const selectExportError = (state) => state.reviewsAnalyticsExport.exportError;
export const selectExportHistory = (state) => state.reviewsAnalyticsExport.exportHistory;
export const selectLastExported = (state) => state.reviewsAnalyticsExport.lastExported;
export const selectSupportedFormats = (state) => state.reviewsAnalyticsExport.supportedFormats;

export default analyticsExportSlice.reducer;