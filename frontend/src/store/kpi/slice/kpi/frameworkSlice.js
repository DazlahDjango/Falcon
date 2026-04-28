import { createSlice } from '@reduxjs/toolkit';

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
        // Sectors
        fetchSectorsStart: (state) => {
            state.sectors.loading = true;
        },
        fetchSectorsSuccess: (state, action) => {
            state.sectors.loading = false;
            state.sectors.items = action.payload;
        },
        fetchSectorsFailure: (state, action) => {
            state.sectors.loading = false;
            state.sectors.error = action.payload;
        },
        // Frameworks
        fetchFrameworksStart: (state) => {
            state.frameworks.loading = true;
        },
        fetchFrameworksSuccess: (state, action) => {
            state.frameworks.loading = false;
            state.frameworks.items = action.payload;
        },
        fetchFrameworksFailure: (state, action) => {
            state.frameworks.loading = false;
            state.frameworks.error = action.payload;
        },
        // Categories
        fetchCategoriesStart: (state) => {
            state.categories.loading = true;
        },
        fetchCategoriesSuccess: (state, action) => {
            state.categories.loading = false;
            state.categories.items = action.payload;
        },
        fetchCategoriesFailure: (state, action) => {
            state.categories.loading = false;
            state.categories.error = action.payload;
        },
        // Templates
        fetchTemplatesStart: (state) => {
            state.templates.loading = true;
        },
        fetchTemplatesSuccess: (state, action) => {
            state.templates.loading = false;
            state.templates.items = action.payload;
        },
        fetchTemplatesFailure: (state, action) => {
            state.templates.loading = false;
            state.templates.error = action.payload;
        },
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
});
export const {
    fetchSectorsStart,
    fetchSectorsSuccess,
    fetchSectorsFailure,
    fetchFrameworksStart,
    fetchFrameworksSuccess,
    fetchFrameworksFailure,
    fetchCategoriesStart,
    fetchCategoriesSuccess,
    fetchCategoriesFailure,
    fetchTemplatesStart,
    fetchTemplatesSuccess,
    fetchTemplatesFailure,
    setCurrentFramework,
    setCurrentCategory,
    setCurrentSector,
    clearCurrent,
} = frameworkSlice.actions;
export default frameworkSlice.reducer;