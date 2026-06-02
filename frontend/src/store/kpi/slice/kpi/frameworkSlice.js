import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frameworkService } from '../../../../services/kpi';

// ============ SECTOR THUNKS ============
export const fetchSectors = createAsyncThunk(
    'framework/fetchSectors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await frameworkService.getSectors();
            return response.results || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch sectors');
        }
    }
);

export const fetchSectorById = createAsyncThunk(
    'framework/fetchSectorById',
    async (id, { rejectWithValue }) => {
        try {
            return await frameworkService.getSector(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch sector');
        }
    }
);

export const createSector = createAsyncThunk(
    'framework/createSector',
    async (data, { rejectWithValue }) => {
        try {
            const response = await frameworkService.createSector(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create sector');
        }
    }
);

export const updateSector = createAsyncThunk(
    'framework/updateSector',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.updateSector(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update sector');
        }
    }
);

export const deleteSector = createAsyncThunk(
    'framework/deleteSector',
    async (id, { rejectWithValue }) => {
        try {
            await frameworkService.deleteSector(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete sector');
        }
    }
);

// ============ FRAMEWORK THUNKS ============
export const fetchFrameworks = createAsyncThunk(
    'framework/fetchFrameworks',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await frameworkService.getFrameworks(params);
            return response.results || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch frameworks');
        }
    }
);

export const fetchFrameworkById = createAsyncThunk(
    'framework/fetchFrameworkById',
    async (id, { rejectWithValue }) => {
        try {
            return await frameworkService.getFramework(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch framework');
        }
    }
);

export const createFramework = createAsyncThunk(
    'framework/createFramework',
    async (data, { rejectWithValue }) => {
        try {
            const response = await frameworkService.createFramework(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create framework');
        }
    }
);

export const updateFramework = createAsyncThunk(
    'framework/updateFramework',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.updateFramework(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update framework');
        }
    }
);

export const deleteFramework = createAsyncThunk(
    'framework/deleteFramework',
    async (id, { rejectWithValue }) => {
        try {
            await frameworkService.deleteFramework(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete framework');
        }
    }
);

export const publishFramework = createAsyncThunk(
    'framework/publishFramework',
    async (id, { rejectWithValue }) => {
        try {
            const response = await frameworkService.publishFramework(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to publish framework');
        }
    }
);

export const archiveFramework = createAsyncThunk(
    'framework/archiveFramework',
    async (id, { rejectWithValue }) => {
        try {
            const response = await frameworkService.archiveFramework(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to archive framework');
        }
    }
);

export const duplicateFramework = createAsyncThunk(
    'framework/duplicateFramework',
    async (id, { rejectWithValue }) => {
        try {
            const response = await frameworkService.duplicateFramework(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to duplicate framework');
        }
    }
);

// ============ CATEGORY THUNKS ============
export const fetchCategories = createAsyncThunk(
    'framework/fetchCategories',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await frameworkService.getCategories(params);
            return response.results || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    'framework/fetchCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            return await frameworkService.getCategory(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch category');
        }
    }
);

export const createCategory = createAsyncThunk(
    'framework/createCategory',
    async (data, { rejectWithValue }) => {
        try {
            const response = await frameworkService.createCategory(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'framework/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.updateCategory(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update category');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'framework/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await frameworkService.deleteCategory(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete category');
        }
    }
);

export const moveCategory = createAsyncThunk(
    'framework/moveCategory',
    async ({ id, parentId }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.moveCategory(id, parentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to move category');
        }
    }
);

export const reorderCategories = createAsyncThunk(
    'framework/reorderCategories',
    async (categories, { rejectWithValue }) => {
        try {
            const response = await frameworkService.reorderCategories(categories);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to reorder categories');
        }
    }
);

// ============ TEMPLATE THUNKS ============
export const fetchTemplates = createAsyncThunk(
    'framework/fetchTemplates',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await frameworkService.getTemplates(params);
            return response.results || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates');
        }
    }
);

export const fetchTemplateById = createAsyncThunk(
    'framework/fetchTemplateById',
    async (id, { rejectWithValue }) => {
        try {
            return await frameworkService.getTemplate(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch template');
        }
    }
);

export const createTemplate = createAsyncThunk(
    'framework/createTemplate',
    async (data, { rejectWithValue }) => {
        try {
            const response = await frameworkService.createTemplate(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create template');
        }
    }
);

export const updateTemplate = createAsyncThunk(
    'framework/updateTemplate',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.updateTemplate(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update template');
        }
    }
);

export const deleteTemplate = createAsyncThunk(
    'framework/deleteTemplate',
    async (id, { rejectWithValue }) => {
        try {
            await frameworkService.deleteTemplate(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete template');
        }
    }
);

export const publishTemplate = createAsyncThunk(
    'framework/publishTemplate',
    async (id, { rejectWithValue }) => {
        try {
            const response = await frameworkService.publishTemplate(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to publish template');
        }
    }
);

export const useTemplate = createAsyncThunk(
    'framework/useTemplate',
    async ({ id, frameworkId }, { rejectWithValue }) => {
        try {
            const response = await frameworkService.useTemplate(id, frameworkId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to use template');
        }
    }
);

// ============ ADMIN OVERVIEW ============
export const fetchAdminOverview = createAsyncThunk(
    'framework/fetchAdminOverview',
    async (_, { rejectWithValue }) => {
        try {
            return await frameworkService.getAdminOverview();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch admin overview');
        }
    }
);

// Initial State
const initialState = {
    sectors: {
        items: [],
        loading: false,
        error: null,
    },
    frameworks: {
        items: [],
        loading: false,
        error: null,
    },
    categories: {
        items: [],
        loading: false,
        error: null,
    },
    templates: {
        items: [],
        loading: false,
        error: null,
    },
    adminOverview: {
        data: null,
        loading: false,
        error: null,
    },
    current: {
        framework: null,
        category: null,
        sector: null,
        template: null,
    },
};

const frameworkSlice = createSlice({
    name: 'framework',
    initialState,
    reducers: {
        // Current selection
        setCurrentFramework: (state, action) => {
            state.current.framework = action.payload;
        },
        setCurrentCategory: (state, action) => {
            state.current.category = action.payload;
        },
        setCurrentSector: (state, action) => {
            state.current.sector = action.payload;
        },
        setCurrentTemplate: (state, action) => {
            state.current.template = action.payload;
        },
        clearCurrent: (state) => {
            state.current = initialState.current;
        },
        // Clear errors
        clearSectorError: (state) => {
            state.sectors.error = null;
        },
        clearFrameworkError: (state) => {
            state.frameworks.error = null;
        },
        clearCategoryError: (state) => {
            state.categories.error = null;
        },
        clearTemplateError: (state) => {
            state.templates.error = null;
        },
        // Reset state
        resetFrameworkState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // ============ SECTORS ============
            .addCase(fetchSectors.pending, (state) => {
                state.sectors.loading = true;
                state.sectors.error = null;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors.loading = false;
                state.sectors.items = action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.sectors.loading = false;
                state.sectors.error = action.payload;
            })
            .addCase(createSector.fulfilled, (state, action) => {
                state.sectors.items.unshift(action.payload);
            })
            .addCase(updateSector.fulfilled, (state, action) => {
                const index = state.sectors.items.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.sectors.items[index] = action.payload;
                }
            })
            .addCase(deleteSector.fulfilled, (state, action) => {
                state.sectors.items = state.sectors.items.filter(s => s.id !== action.payload);
            })

            // ============ FRAMEWORKS ============
            .addCase(fetchFrameworks.pending, (state) => {
                state.frameworks.loading = true;
                state.frameworks.error = null;
            })
            .addCase(fetchFrameworks.fulfilled, (state, action) => {
                state.frameworks.loading = false;
                state.frameworks.items = action.payload;
            })
            .addCase(fetchFrameworks.rejected, (state, action) => {
                state.frameworks.loading = false;
                state.frameworks.error = action.payload;
            })
            .addCase(createFramework.fulfilled, (state, action) => {
                state.frameworks.items.unshift(action.payload);
            })
            .addCase(updateFramework.fulfilled, (state, action) => {
                const index = state.frameworks.items.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.frameworks.items[index] = action.payload;
                }
                if (state.current.framework?.id === action.payload.id) {
                    state.current.framework = action.payload;
                }
            })
            .addCase(deleteFramework.fulfilled, (state, action) => {
                state.frameworks.items = state.frameworks.items.filter(f => f.id !== action.payload);
            })
            .addCase(publishFramework.fulfilled, (state, action) => {
                const index = state.frameworks.items.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.frameworks.items[index] = action.payload;
                }
            })
            .addCase(archiveFramework.fulfilled, (state, action) => {
                const index = state.frameworks.items.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.frameworks.items[index] = action.payload;
                }
            })
            .addCase(duplicateFramework.fulfilled, (state, action) => {
                state.frameworks.items.unshift(action.payload);
            })

            // ============ CATEGORIES ============
            .addCase(fetchCategories.pending, (state) => {
                state.categories.loading = true;
                state.categories.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories.loading = false;
                state.categories.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.categories.loading = false;
                state.categories.error = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.items.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.categories.items[index] = action.payload;
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories.items = state.categories.items.filter(c => c.id !== action.payload);
            })
            .addCase(moveCategory.fulfilled, (state, action) => {
                const index = state.categories.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.categories.items[index] = action.payload;
                }
            })

            // ============ TEMPLATES ============
            .addCase(fetchTemplates.pending, (state) => {
                state.templates.loading = true;
                state.templates.error = null;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.templates.loading = false;
                state.templates.items = action.payload;
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.templates.loading = false;
                state.templates.error = action.payload;
            })
            .addCase(createTemplate.fulfilled, (state, action) => {
                state.templates.items.unshift(action.payload);
            })
            .addCase(updateTemplate.fulfilled, (state, action) => {
                const index = state.templates.items.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.templates.items[index] = action.payload;
                }
            })
            .addCase(deleteTemplate.fulfilled, (state, action) => {
                state.templates.items = state.templates.items.filter(t => t.id !== action.payload);
            })
            .addCase(publishTemplate.fulfilled, (state, action) => {
                const index = state.templates.items.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.templates.items[index] = action.payload;
                }
            })

            // ============ ADMIN OVERVIEW ============
            .addCase(fetchAdminOverview.pending, (state) => {
                state.adminOverview.loading = true;
                state.adminOverview.error = null;
            })
            .addCase(fetchAdminOverview.fulfilled, (state, action) => {
                state.adminOverview.loading = false;
                state.adminOverview.data = action.payload;
            })
            .addCase(fetchAdminOverview.rejected, (state, action) => {
                state.adminOverview.loading = false;
                state.adminOverview.error = action.payload;
            });
    }
});

export const {
    setCurrentFramework,
    setCurrentCategory,
    setCurrentSector,
    setCurrentTemplate,
    clearCurrent,
    clearSectorError,
    clearFrameworkError,
    clearCategoryError,
    clearTemplateError,
    resetFrameworkState,
} = frameworkSlice.actions;

export default frameworkSlice.reducer;