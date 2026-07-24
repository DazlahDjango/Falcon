// ============================================
// apps/reportplt/slice/template.slice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { templateService } from '../../../services/reports';
import { extractApiError } from '../../../services/api';

const initialState = {
    templates: [],
    currentTemplate: null,
    prebuiltTemplates: [],
    defaultTemplates: [],
    popularTemplates: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { template_type: null, sector: null, category: null, is_published: null, is_system: null, is_default: null, search: '' },
    types: [],
};

export const fetchTemplates = createAsyncThunk(
    'template/fetchTemplates',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await templateService.getTemplates(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchTemplate = createAsyncThunk(
    'template/fetchTemplate',
    async (id, { rejectWithValue }) => {
        try {
            const response = await templateService.getTemplate(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const createTemplate = createAsyncThunk(
    'template/createTemplate',
    async (data, { rejectWithValue }) => {
        try {
            const response = await templateService.createTemplate(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const updateTemplate = createAsyncThunk(
    'template/updateTemplate',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await templateService.updateTemplate(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const deleteTemplate = createAsyncThunk(
    'template/deleteTemplate',
    async (id, { rejectWithValue }) => {
        try {
            await templateService.deleteTemplate(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const performTemplateAction = createAsyncThunk(
    'template/performAction',
    async ({ id, action, data = {} }, { rejectWithValue }) => {
        try {
            const response = await templateService.performAction(id, action, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const applyTemplate = createAsyncThunk(
    'template/applyTemplate',
    async ({ id, reportId }, { rejectWithValue }) => {
        try {
            const response = await templateService.applyTemplate(id, reportId);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchPrebuiltTemplates = createAsyncThunk(
    'template/fetchPrebuiltTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await templateService.getPrebuiltTemplates();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchDefaultTemplates = createAsyncThunk(
    'template/fetchDefaultTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await templateService.getDefaultTemplates();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchPopularTemplates = createAsyncThunk(
    'template/fetchPopularTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await templateService.getPopularTemplates();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchTemplatesBySector = createAsyncThunk(
    'template/fetchTemplatesBySector',
    async (sector, { rejectWithValue }) => {
        try {
            const response = await templateService.getTemplatesBySector(sector);
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

export const fetchTemplateTypes = createAsyncThunk(
    'template/fetchTemplateTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await templateService.getTemplateTypes();
            return response.data;
        } catch (error) {
            return rejectWithValue(extractApiError(error));
        }
    }
);

const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        clearCurrentTemplate: (state) => {
            state.currentTemplate = null;
        },
        clearErrors: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearAllTemplates: (state) => {
            state.templates = [];
            state.prebuiltTemplates = [];
            state.defaultTemplates = [];
            state.popularTemplates = [];
            state.pagination = initialState.pagination;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTemplates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.templates = Array.isArray(payload) ? payload : (payload?.results || []);
                if (payload?.count) {
                    state.pagination.total = payload.count;
                    state.pagination.totalPages = Math.ceil(payload.count / state.pagination.pageSize);
                }
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTemplate.pending, (state) => {
                state.loadingDetails = true;
                state.error = null;
            })
            .addCase(fetchTemplate.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.currentTemplate = action.payload;
                const index = state.templates.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.templates[index] = action.payload;
            })
            .addCase(fetchTemplate.rejected, (state, action) => {
                state.loadingDetails = false;
                state.error = action.payload;
            })
            .addCase(createTemplate.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createTemplate.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentTemplate = action.payload;
                state.templates.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createTemplate.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(updateTemplate.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateTemplate.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentTemplate = action.payload;
                const index = state.templates.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.templates[index] = action.payload;
            })
            .addCase(updateTemplate.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            .addCase(deleteTemplate.fulfilled, (state, action) => {
                state.templates = state.templates.filter(t => t.id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(performTemplateAction.fulfilled, (state, action) => {
                if (action.payload?.id) {
                    const index = state.templates.findIndex(t => t.id === action.payload.id);
                    if (index !== -1) state.templates[index] = action.payload;
                    if (state.currentTemplate?.id === action.payload.id) state.currentTemplate = action.payload;
                }
            })
            .addCase(fetchPrebuiltTemplates.fulfilled, (state, action) => {
                state.prebuiltTemplates = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchDefaultTemplates.fulfilled, (state, action) => {
                state.defaultTemplates = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchPopularTemplates.fulfilled, (state, action) => {
                state.popularTemplates = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchTemplateTypes.fulfilled, (state, action) => {
                state.types = Array.isArray(action.payload) ? action.payload : [];
            });
    },
});

export const {
    clearCurrentTemplate,
    clearErrors,
    setFilters,
    resetFilters,
    setPagination,
    clearAllTemplates,
} = templateSlice.actions;

// Aliases for compatibility with useTemplates hook
export const clearTemplateErrors = clearErrors;
export const setTemplateFilters = setFilters;
export const resetTemplateFilters = resetFilters;
export const setTemplatePagination = setPagination;

export default templateSlice.reducer;