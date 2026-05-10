import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frameworkService } from '../../../../services/kpi';

// Async Thunks
export const fetchSectors = createAsyncThunk(
    'framework/fetchSectors',
    async (_, { rejectWithValue }) => {
        try {
            return await frameworkService.getSectors();
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch sectors');
        }
    }
);

export const fetchFrameworks = createAsyncThunk(
    'framework/fetchFrameworks',
    async (params, { rejectWithValue }) => {
        try {
            return await frameworkService.getFrameworks(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch frameworks');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'framework/fetchCategories',
    async (params, { rejectWithValue }) => {
        try {
            return await frameworkService.getCategories(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch categories');
        }
    }
);

export const fetchTemplates = createAsyncThunk(
    'framework/fetchTemplates',
    async (params, { rejectWithValue }) => {
        try {
            return await frameworkService.getTemplates(params);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch templates');
        }
    }
);

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
    current: {
        framework: null,
        category: null,
        sector: null,
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
        clearCurrent: (state) => {
            state.current = initialState.current;
        },
    },
    extraReducers: (builder) => {
        builder
            // Sectors
            .addCase(fetchSectors.pending, (state) => {
                state.sectors.loading = true;
                state.sectors.error = null;
            })
            .addCase(fetchSectors.fulfilled, (state, action) => {
                state.sectors.loading = false;
                state.sectors.items = action.payload.results || action.payload;
            })
            .addCase(fetchSectors.rejected, (state, action) => {
                state.sectors.loading = false;
                state.sectors.error = action.payload;
            })
            // Frameworks
            .addCase(fetchFrameworks.pending, (state) => {
                state.frameworks.loading = true;
                state.frameworks.error = null;
            })
            .addCase(fetchFrameworks.fulfilled, (state, action) => {
                state.frameworks.loading = false;
                state.frameworks.items = action.payload.results || action.payload;
            })
            .addCase(fetchFrameworks.rejected, (state, action) => {
                state.frameworks.loading = false;
                state.frameworks.error = action.payload;
            })
            // Categories
            .addCase(fetchCategories.pending, (state) => {
                state.categories.loading = true;
                state.categories.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories.loading = false;
                state.categories.items = action.payload.results || action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.categories.loading = false;
                state.categories.error = action.payload;
            })
            // Templates
            .addCase(fetchTemplates.pending, (state) => {
                state.templates.loading = true;
                state.templates.error = null;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.templates.loading = false;
                state.templates.items = action.payload.results || action.payload;
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.templates.loading = false;
                state.templates.error = action.payload;
            });
    }
});

export const {
    setCurrentFramework,
    setCurrentCategory,
    setCurrentSector,
    clearCurrent,
} = frameworkSlice.actions;

export default frameworkSlice.reducer;