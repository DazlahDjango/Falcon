// src/store/reviews/slices/competency.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  competencyService,
  competencyCategoryService,
  competencyRatingService,
} from '../../../services/reviews';

// ============ Competency Category Thunks ============
export const fetchCompetencyCategories = createAsyncThunk(
  'competencyCategories/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyCategoryService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyCategory = createAsyncThunk(
  'competencyCategories/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompetencyCategory = createAsyncThunk(
  'competencyCategories/create',
  async (data, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCompetencyCategory = createAsyncThunk(
  'competencyCategories/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompetencyCategory = createAsyncThunk(
  'competencyCategories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await competencyCategoryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCompetencyCategory = createAsyncThunk(
  'competencyCategories/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCompetencyCategory = createAsyncThunk(
  'competencyCategories/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategoryCompetencies = createAsyncThunk(
  'competencyCategories/fetchCompetencies',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyCategoryService.getCompetencies(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Thunks ============
export const fetchCompetencies = createAsyncThunk(
  'competencies/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetency = createAsyncThunk(
  'competencies/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompetency = createAsyncThunk(
  'competencies/create',
  async (data, { rejectWithValue }) => {
    try {
      return await competencyService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCompetency = createAsyncThunk(
  'competencies/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await competencyService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompetency = createAsyncThunk(
  'competencies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await competencyService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCompetency = createAsyncThunk(
  'competencies/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCompetency = createAsyncThunk(
  'competencies/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveCompetencies = createAsyncThunk(
  'competencies/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await competencyService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRequiredCompetencies = createAsyncThunk(
  'competencies/fetchRequired',
  async (_, { rejectWithValue }) => {
    try {
      return await competencyService.getRequired();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetenciesByType = createAsyncThunk(
  'competencies/fetchByType',
  async (type, { rejectWithValue }) => {
    try {
      return await competencyService.getByType(type);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyUsageStats = createAsyncThunk(
  'competencies/fetchUsageStats',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyService.getUsageStats(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Rating Thunks ============
export const fetchCompetencyRatings = createAsyncThunk(
  'competencyRatings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await competencyRatingService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompetencyRating = createAsyncThunk(
  'competencyRatings/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await competencyRatingService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRatingsByAssessment = createAsyncThunk(
  'competencyRatings/fetchByAssessment',
  async (assessmentId, { rejectWithValue }) => {
    try {
      return await competencyRatingService.getByAssessment(assessmentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchRatingsByReview = createAsyncThunk(
  'competencyRatings/fetchByReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      return await competencyRatingService.getByReview(reviewId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkCreateCompetencyRatings = createAsyncThunk(
  'competencyRatings/bulkCreate',
  async ({ parentId, parentType, ratings }, { rejectWithValue }) => {
    try {
      return await competencyRatingService.bulkCreate(parentId, parentType, ratings);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Competency Category Slice ============
const competencyCategoryInitialState = {
  items: [],
  selectedItem: null,
  categoryCompetencies: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
};

const competencyCategorySlice = createSlice({
  name: 'competencyCategories',
  initialState: competencyCategoryInitialState,
  reducers: {
    resetCategoryState: (state) => {
      Object.assign(state, competencyCategoryInitialState);
    },
    setCategoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearCategoryFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setCategoryPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectCategory: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedItem = null;
    },
    clearCategoryErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchCompetencyCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencyCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchCompetencyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetencyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createCompetencyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompetencyCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createCompetencyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateCompetencyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompetencyCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateCompetencyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteCompetencyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompetencyCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteCompetencyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Activate
    builder
      .addCase(activateCompetencyCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Deactivate
    builder
      .addCase(deactivateCompetencyCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Fetch Category Competencies
    builder
      .addCase(fetchCategoryCompetencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryCompetencies.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryCompetencies = action.payload;
      })
      .addCase(fetchCategoryCompetencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ============ Competency Slice ============
const competencyInitialState = {
  items: [],
  selectedItem: null,
  usageStats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
  activeCompetencies: [],
  requiredCompetencies: [],
};

const competencySlice = createSlice({
  name: 'competencies',
  initialState: competencyInitialState,
  reducers: {
    resetCompetencyState: (state) => {
      Object.assign(state, competencyInitialState);
    },
    setCompetencyFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearCompetencyFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setCompetencyPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectCompetency: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedCompetency: (state) => {
      state.selectedItem = null;
    },
    clearCompetencyErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchCompetencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencies.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchCompetency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetency.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createCompetency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompetency.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createCompetency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateCompetency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompetency.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateCompetency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteCompetency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompetency.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteCompetency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Activate
    builder
      .addCase(activateCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Deactivate
    builder
      .addCase(deactivateCompetency.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      });

    // Fetch Active
    builder
      .addCase(fetchActiveCompetencies.fulfilled, (state, action) => {
        state.activeCompetencies = action.payload;
      });

    // Fetch Required
    builder
      .addCase(fetchRequiredCompetencies.fulfilled, (state, action) => {
        state.requiredCompetencies = action.payload;
      });

    // Fetch Usage Stats
    builder
      .addCase(fetchCompetencyUsageStats.fulfilled, (state, action) => {
        state.usageStats = action.payload;
      });

    // Fetch By Type
    builder
      .addCase(fetchCompetenciesByType.fulfilled, (state, action) => {
        // The items will be filtered in the selector
        state.items = action.payload;
      });
  },
});

// ============ Competency Rating Slice ============
const competencyRatingInitialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
};

const competencyRatingSlice = createSlice({
  name: 'competencyRatings',
  initialState: competencyRatingInitialState,
  reducers: {
    resetRatingState: (state) => {
      Object.assign(state, competencyRatingInitialState);
    },
    setRatingPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectRating: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedRating: (state) => {
      state.selectedItem = null;
    },
    clearRatingErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchCompetencyRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCompetencyRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch One
    builder
      .addCase(fetchCompetencyRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompetencyRating.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCompetencyRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Assessment
    builder
      .addCase(fetchRatingsByAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingsByAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRatingsByAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Review
    builder
      .addCase(fetchRatingsByReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingsByReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRatingsByReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Bulk Create
    builder
      .addCase(bulkCreateCompetencyRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCreateCompetencyRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(bulkCreateCompetencyRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ============ Exports ============
export const competencyCategoryReducer = competencyCategorySlice.reducer;
export const competencyCategoryActions = competencyCategorySlice.actions;
export const resetCategoryState = competencyCategorySlice.actions.resetCategoryState;

export const competencyReducer = competencySlice.reducer;
export const competencyActions = competencySlice.actions;
export const resetCompetencyState = competencySlice.actions.resetCompetencyState;


export const competencyRatingReducer = competencyRatingSlice.reducer;
export const competencyRatingActions = competencyRatingSlice.actions;
export const resetRatingState = competencyRatingSlice.actions.resetRatingState;
