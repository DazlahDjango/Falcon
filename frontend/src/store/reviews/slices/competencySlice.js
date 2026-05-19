// src/store/reviews/slices/competencySlice.js
// Redux slice for competency state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { competencyService, competencyCategoryService, competencyRatingService } from '@/services/reviews';

// ========== Competency Async Thunks ==========

export const fetchCompetencies = createAsyncThunk(
    'reviews/competencies/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await competencyService.getAll(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch competencies');
        }
    }
);

export const fetchActiveCompetencies = createAsyncThunk(
    'reviews/competencies/fetchActive',
    async (_, { rejectWithValue }) => {
        try {
            const response = await competencyService.getActive();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch active competencies');
        }
    }
);

export const fetchRequiredCompetencies = createAsyncThunk(
    'reviews/competencies/fetchRequired',
    async (_, { rejectWithValue }) => {
        try {
            const response = await competencyService.getRequired();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch required competencies');
        }
    }
);

export const getCompetencyById = createAsyncThunk(
    'reviews/competencies/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await competencyService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch competency');
        }
    }
);

export const createCompetency = createAsyncThunk(
    'reviews/competencies/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyService.create(data);
            await dispatch(fetchCompetencies());
            await dispatch(fetchActiveCompetencies());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create competency');
        }
    }
);

export const updateCompetency = createAsyncThunk(
    'reviews/competencies/update',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyService.update(id, data);
            await dispatch(fetchCompetencies());
            await dispatch(fetchActiveCompetencies());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update competency');
        }
    }
);

export const deleteCompetency = createAsyncThunk(
    'reviews/competencies/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyService.delete(id);
            await dispatch(fetchCompetencies());
            await dispatch(fetchActiveCompetencies());
            await dispatch(fetchRequiredCompetencies());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete competency');
        }
    }
);

// ========== Category Async Thunks ==========

export const fetchCategories = createAsyncThunk(
    'reviews/competencies/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await competencyCategoryService.getAll();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch categories');
        }
    }
);

export const getCategoryById = createAsyncThunk(
    'reviews/competencies/getCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await competencyCategoryService.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch category');
        }
    }
);

export const createCategory = createAsyncThunk(
    'reviews/competencies/createCategory',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyCategoryService.create(data);
            await dispatch(fetchCategories());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'reviews/competencies/updateCategory',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyCategoryService.update(id, data);
            await dispatch(fetchCategories());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update category');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'reviews/competencies/deleteCategory',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await competencyCategoryService.delete(id);
            await dispatch(fetchCategories());
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete category');
        }
    }
);

// ========== Competency Rating Async Thunks ==========

export const getRatingsForSelfAssessment = createAsyncThunk(
    'reviews/competencies/getRatingsForSelfAssessment',
    async (assessmentId, { rejectWithValue }) => {
        try {
            const response = await competencyRatingService.getForSelfAssessment(assessmentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch competency ratings');
        }
    }
);

export const getRatingsForSupervisorReview = createAsyncThunk(
    'reviews/competencies/getRatingsForSupervisorReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await competencyRatingService.getForSupervisorReview(reviewId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch competency ratings');
        }
    }
);

export const bulkCreateRatings = createAsyncThunk(
    'reviews/competencies/bulkCreateRatings',
    async (data, { rejectWithValue }) => {
        try {
            const response = await competencyRatingService.bulkCreate(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save competency ratings');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    // Competencies
    competencies: [],
    activeCompetencies: [],
    requiredCompetencies: [],
    currentCompetency: null,
    // Categories
    categories: [],
    currentCategory: null,
    // Ratings
    competencyRatings: [],
    loading: false,
    error: null,
};

// ========== Slice ==========
const competencySlice = createSlice({
    name: 'reviewsCompetencies',
    initialState,
    reducers: {
        clearCompetencyError: (state) => {
            state.error = null;
        },
        clearCurrentCompetency: (state) => {
            state.currentCompetency = null;
        },
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
        },
        clearCompetencyRatings: (state) => {
            state.competencyRatings = [];
        },
        clearCompetencyState: (state) => {
            state.competencies = [];
            state.activeCompetencies = [];
            state.requiredCompetencies = [];
            state.currentCompetency = null;
            state.categories = [];
            state.currentCategory = null;
            state.competencyRatings = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch competencies
            .addCase(fetchCompetencies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompetencies.fulfilled, (state, action) => {
                state.loading = false;
                state.competencies = action.payload;
            })
            .addCase(fetchCompetencies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch active competencies
            .addCase(fetchActiveCompetencies.fulfilled, (state, action) => {
                state.activeCompetencies = action.payload;
            })
            // Fetch required competencies
            .addCase(fetchRequiredCompetencies.fulfilled, (state, action) => {
                state.requiredCompetencies = action.payload;
            })
            // Get competency by ID
            .addCase(getCompetencyById.fulfilled, (state, action) => {
                state.currentCompetency = action.payload;
            })
            // Fetch categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Get category by ID
            .addCase(getCategoryById.fulfilled, (state, action) => {
                state.currentCategory = action.payload;
            })
            // Get ratings
            .addCase(getRatingsForSelfAssessment.fulfilled, (state, action) => {
                state.competencyRatings = action.payload;
            })
            .addCase(getRatingsForSupervisorReview.fulfilled, (state, action) => {
                state.competencyRatings = action.payload;
            });
    },
});

export const {
    clearCompetencyError,
    clearCurrentCompetency,
    clearCurrentCategory,
    clearCompetencyRatings,
    clearCompetencyState,
} = competencySlice.actions;

export default competencySlice.reducer;