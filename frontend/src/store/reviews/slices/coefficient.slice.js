// src/store/reviews/slices/coefficient.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coefficientService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchCoefficients = createAsyncThunk(
  'coefficients/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await coefficientService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficient = createAsyncThunk(
  'coefficients/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await coefficientService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCoefficient = createAsyncThunk(
  'coefficients/create',
  async (data, { rejectWithValue }) => {
    try {
      return await coefficientService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCoefficient = createAsyncThunk(
  'coefficients/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await coefficientService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchCoefficient = createAsyncThunk(
  'coefficients/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await coefficientService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCoefficient = createAsyncThunk(
  'coefficients/delete',
  async (id, { rejectWithValue }) => {
    try {
      await coefficientService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCoefficient = createAsyncThunk(
  'coefficients/activate',
  async (id, { rejectWithValue }) => {
    try {
      return await coefficientService.activate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCoefficient = createAsyncThunk(
  'coefficients/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      return await coefficientService.deactivate(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveCoefficients = createAsyncThunk(
  'coefficients/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      return await coefficientService.getActive();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyCoefficient = createAsyncThunk(
  'coefficients/apply',
  async ({ score, coefficientValue }, { rejectWithValue }) => {
    try {
      return await coefficientService.applyCoefficient(score, coefficientValue);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByDepartment = createAsyncThunk(
  'coefficients/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      return await coefficientService.getByDepartment(departmentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByPosition = createAsyncThunk(
  'coefficients/fetchByPosition',
  async (positionId, { rejectWithValue }) => {
    try {
      return await coefficientService.getByPosition(positionId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByUser = createAsyncThunk(
  'coefficients/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await coefficientService.getByUser(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  activeCoefficients: [],
  applyResult: null,
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

const coefficientSlice = createSlice({
  name: 'coefficients',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelected: (state) => {
      state.selectedItem = null;
    },
    clearApplyResult: (state) => {
      state.applyResult = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchCoefficients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchCoefficients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updateCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Patch =====
    builder
      .addCase(patchCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = { ...state.selectedItem, ...action.payload };
        }
      })
      .addCase(patchCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deleteCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Activate =====
    builder
      .addCase(activateCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(activateCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Deactivate =====
    builder
      .addCase(deactivateCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deactivateCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Active =====
    builder
      .addCase(fetchActiveCoefficients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCoefficients.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCoefficients = action.payload;
      })
      .addCase(fetchActiveCoefficients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Apply Coefficient =====
    builder
      .addCase(applyCoefficient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoefficient.fulfilled, (state, action) => {
        state.loading = false;
        state.applyResult = action.payload;
      })
      .addCase(applyCoefficient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By Department =====
    builder
      .addCase(fetchCoefficientsByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By Position =====
    builder
      .addCase(fetchCoefficientsByPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By User =====
    builder
      .addCase(fetchCoefficientsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const coefficientReducer = coefficientSlice.reducer;
export const coefficientActions = coefficientSlice.actions;
export const resetCoefficientState = coefficientSlice.actions.resetState;
