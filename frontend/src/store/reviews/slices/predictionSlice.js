// src/store/reviews/slices/predictionSlice.js
// Redux slice for flight risk predictions state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { predictionService } from '@/services/reviews';
import { RISK_LEVELS } from '@/config/constants/reviewConstants';

// ========== Async Thunks ==========

// Fetch all predictions
export const fetchPredictions = createAsyncThunk(
    'reviews/predictions/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await predictionService.getPredictions(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch predictions');
        }
    }
);

// Fetch high risk employees
export const fetchHighRiskEmployees = createAsyncThunk(
    'reviews/predictions/fetchHighRisk',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await predictionService.getHighRiskEmployees(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch high risk employees');
        }
    }
);

// Fetch employee risk assessment
export const fetchEmployeeRisk = createAsyncThunk(
    'reviews/predictions/fetchEmployeeRisk',
    async ({ employeeId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await predictionService.getEmployeeRisk(employeeId, params);
            return { employeeId, data: response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch employee risk');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    predictions: [],
    highRiskEmployees: [],
    totalCount: 0,
    highRiskCount: 0,
    loading: false,
    error: null,
    employeeRiskData: {},
    filters: {
        risk_level: null,
        department_id: null,
        limit: 20,
        offset: 0,
    },
    riskLevelCounts: {
        [RISK_LEVELS.LOW]: 0,
        [RISK_LEVELS.MEDIUM]: 0,
        [RISK_LEVELS.HIGH]: 0,
        [RISK_LEVELS.CRITICAL]: 0,
    },
};

// ========== Slice ==========
const predictionSlice = createSlice({
    name: 'reviews/predictions',
    initialState,
    reducers: {
        clearPredictionErrors: (state) => {
            state.error = null;
        },
        setPredictionFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload, offset: 0 };
        },
        resetPredictionFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearEmployeeRiskData: (state, action) => {
            if (action.payload) {
                delete state.employeeRiskData[action.payload];
            } else {
                state.employeeRiskData = {};
            }
        },
        clearAllPredictions: (state) => {
            return initialState;
        },
        updateRiskLevelCounts: (state) => {
            const counts = {
                [RISK_LEVELS.LOW]: 0,
                [RISK_LEVELS.MEDIUM]: 0,
                [RISK_LEVELS.HIGH]: 0,
                [RISK_LEVELS.CRITICAL]: 0,
            };
            state.predictions.forEach(pred => {
                if (counts[pred.risk_level] !== undefined) {
                    counts[pred.risk_level]++;
                }
            });
            state.riskLevelCounts = counts;
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== Fetch Predictions ==========
            .addCase(fetchPredictions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPredictions.fulfilled, (state, action) => {
                state.loading = false;
                state.predictions = action.payload.results || action.payload;
                state.totalCount = action.payload.count || 0;
                // Update risk level counts
                const counts = {
                    [RISK_LEVELS.LOW]: 0,
                    [RISK_LEVELS.MEDIUM]: 0,
                    [RISK_LEVELS.HIGH]: 0,
                    [RISK_LEVELS.CRITICAL]: 0,
                };
                state.predictions.forEach(pred => {
                    if (counts[pred.risk_level] !== undefined) {
                        counts[pred.risk_level]++;
                    }
                });
                state.riskLevelCounts = counts;
            })
            .addCase(fetchPredictions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Fetch High Risk Employees ==========
            .addCase(fetchHighRiskEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHighRiskEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.highRiskEmployees = action.payload.results || action.payload;
                state.highRiskCount = action.payload.count || 0;
            })
            .addCase(fetchHighRiskEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ========== Fetch Employee Risk ==========
            .addCase(fetchEmployeeRisk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeRisk.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeRiskData[action.payload.employeeId] = action.payload.data;
            })
            .addCase(fetchEmployeeRisk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// ========== Actions ==========
export const {
    clearPredictionErrors,
    setPredictionFilters,
    resetPredictionFilters,
    clearEmployeeRiskData,
    clearAllPredictions,
    updateRiskLevelCounts,
} = predictionSlice.actions;

// ========== Selectors ==========
export const selectAllPredictions = (state) => state.reviewsPredictions.predictions;
export const selectHighRiskEmployees = (state) => state.reviewsPredictions.highRiskEmployees;
export const selectPredictionsTotalCount = (state) => state.reviewsPredictions.totalCount;
export const selectHighRiskCount = (state) => state.reviewsPredictions.highRiskCount;
export const selectPredictionsLoading = (state) => state.reviewsPredictions.loading;
export const selectPredictionsError = (state) => state.reviewsPredictions.error;
export const selectPredictionFilters = (state) => state.reviewsPredictions.filters;
export const selectRiskLevelCounts = (state) => state.reviewsPredictions.riskLevelCounts;
export const selectEmployeeRisk = (state, employeeId) => 
    state.reviewsPredictions.employeeRiskData[employeeId];
export const selectPredictionsByRiskLevel = (state, riskLevel) =>
    state.reviewsPredictions.predictions.filter(pred => pred.risk_level === riskLevel);

export default predictionSlice.reducer;