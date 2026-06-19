// src/store/reviews/slices/coefficient.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coefficientService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchCoefficients = createAsyncThunk(
  'coefficients/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchCoefficients called with params:', params);
    try {
      const response = await coefficientService.list(params);
      console.log('[coefficientSlice] fetchCoefficients full Axios response:', response);
      console.log('[coefficientSlice] fetchCoefficients response.data:', response.data);
      console.log('[coefficientSlice] fetchCoefficients response.data.results:', response.data?.results);
      console.log('[coefficientSlice] fetchCoefficients response.data.count:', response.data?.count);
      
      // Handle both pagination formats and direct array responses
      if (Array.isArray(response.data)) {
        console.log('[coefficientSlice] fetchCoefficients returning array directly');
        return response.data;
      } else if (response.data?.results) {
        console.log('[coefficientSlice] fetchCoefficients returning results array with count:', response.data.count);
        return {
          results: response.data.results,
          count: response.data.count
        };
      } else {
        console.log('[coefficientSlice] fetchCoefficients no results found, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('[coefficientSlice] fetchCoefficients failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficient = createAsyncThunk(
  'coefficients/fetchOne',
  async (id, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchCoefficient called with id:', id);
    try {
      const response = await coefficientService.getById(id);
      console.log('[coefficientSlice] fetchCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] fetchCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCoefficient = createAsyncThunk(
  'coefficients/create',
  async (data, { rejectWithValue }) => {
    console.log('[coefficientSlice] createCoefficient called with data:', data);
    try {
      const response = await coefficientService.create(data);
      console.log('[coefficientSlice] createCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] createCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCoefficient = createAsyncThunk(
  'coefficients/update',
  async ({ id, data }, { rejectWithValue }) => {
    console.log('[coefficientSlice] updateCoefficient called with id:', id, 'data:', data);
    try {
      const response = await coefficientService.update(id, data, false);
      console.log('[coefficientSlice] updateCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] updateCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchCoefficient = createAsyncThunk(
  'coefficients/patch',
  async ({ id, data }, { rejectWithValue }) => {
    console.log('[coefficientSlice] patchCoefficient called with id:', id, 'data:', data);
    try {
      const response = await coefficientService.update(id, data, true);
      console.log('[coefficientSlice] patchCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] patchCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCoefficient = createAsyncThunk(
  'coefficients/delete',
  async (id, { rejectWithValue }) => {
    console.log('[coefficientSlice] deleteCoefficient called with id:', id);
    try {
      await coefficientService.delete(id);
      console.log('[coefficientSlice] deleteCoefficient successful:', id);
      return id;
    } catch (error) {
      console.error('[coefficientSlice] deleteCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const activateCoefficient = createAsyncThunk(
  'coefficients/activate',
  async (id, { rejectWithValue }) => {
    console.log('[coefficientSlice] activateCoefficient called with id:', id);
    try {
      const response = await coefficientService.activate(id);
      console.log('[coefficientSlice] activateCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] activateCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deactivateCoefficient = createAsyncThunk(
  'coefficients/deactivate',
  async (id, { rejectWithValue }) => {
    console.log('[coefficientSlice] deactivateCoefficient called with id:', id);
    try {
      const response = await coefficientService.deactivate(id);
      console.log('[coefficientSlice] deactivateCoefficient successful:', response);
      return response.data;
    } catch (error) {
      console.error('[coefficientSlice] deactivateCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveCoefficients = createAsyncThunk(
  'coefficients/fetchActive',
  async (_, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchActiveCoefficients called');
    try {
      const response = await coefficientService.getActive();
      console.log('[coefficientSlice] fetchActiveCoefficients successful:', response);
      return response;
    } catch (error) {
      console.error('[coefficientSlice] fetchActiveCoefficients failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyCoefficient = createAsyncThunk(
  'coefficients/apply',
  async ({ score, coefficientValue }, { rejectWithValue }) => {
    console.log('[coefficientSlice] applyCoefficient called with score:', score, 'coefficientValue:', coefficientValue);
    try {
      const response = await coefficientService.applyCoefficient(score, coefficientValue);
      console.log('[coefficientSlice] applyCoefficient successful:', response);
      return response;
    } catch (error) {
      console.error('[coefficientSlice] applyCoefficient failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByDepartment = createAsyncThunk(
  'coefficients/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchCoefficientsByDepartment called with departmentId:', departmentId);
    try {
      const response = await coefficientService.getByDepartment(departmentId);
      console.log('[coefficientSlice] fetchCoefficientsByDepartment successful:', response);
      return response;
    } catch (error) {
      console.error('[coefficientSlice] fetchCoefficientsByDepartment failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByPosition = createAsyncThunk(
  'coefficients/fetchByPosition',
  async (positionId, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchCoefficientsByPosition called with positionId:', positionId);
    try {
      const response = await coefficientService.getByPosition(positionId);
      console.log('[coefficientSlice] fetchCoefficientsByPosition successful:', response);
      return response;
    } catch (error) {
      console.error('[coefficientSlice] fetchCoefficientsByPosition failed:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCoefficientsByUser = createAsyncThunk(
  'coefficients/fetchByUser',
  async (userId, { rejectWithValue }) => {
    console.log('[coefficientSlice] fetchCoefficientsByUser called with userId:', userId);
    try {
      const response = await coefficientService.getByUser(userId);
      console.log('[coefficientSlice] fetchCoefficientsByUser successful:', response);
      return response;
    } catch (error) {
      console.error('[coefficientSlice] fetchCoefficientsByUser failed:', error);
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
        console.log('[coefficientSlice] fetchCoefficients.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficients.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchCoefficients.fulfilled:', {
          actionPayload: action.payload,
          isArray: Array.isArray(action.payload),
          payloadResults: action.payload?.results,
          payloadCount: action.payload?.count
        });
        state.loading = false;
        
        let newItems = [];
        let totalItems = 0;
        
        if (Array.isArray(action.payload)) {
          newItems = action.payload;
          totalItems = action.payload.length;
        } else {
          newItems = action.payload?.results || [];
          totalItems = action.payload?.count || newItems.length;
        }
        
        console.log('[coefficientSlice] Setting state.items to:', newItems);
        console.log('[coefficientSlice] Setting totalItems to:', totalItems);
        console.log('[coefficientSlice] Current state before update:', { items: state.items });
        
        state.items = newItems;
        state.pagination.totalItems = totalItems;
        state.pagination.totalPages = Math.ceil(
          totalItems / state.pagination.pageSize
        );
        
        console.log('[coefficientSlice] New state after update:', {
          items: state.items,
          pagination: state.pagination
        });
      })
      .addCase(fetchCoefficients.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchCoefficients.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchCoefficient.pending, (state) => {
        console.log('[coefficientSlice] fetchCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchCoefficient.fulfilled:', action.payload);
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCoefficient.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createCoefficient.pending, (state) => {
        console.log('[coefficientSlice] createCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] createCoefficient.fulfilled:', action.payload);
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createCoefficient.rejected, (state, action) => {
        console.error('[coefficientSlice] createCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updateCoefficient.pending, (state) => {
        console.log('[coefficientSlice] updateCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] updateCoefficient.fulfilled:', action.payload);
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
        console.error('[coefficientSlice] updateCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Patch =====
    builder
      .addCase(patchCoefficient.pending, (state) => {
        console.log('[coefficientSlice] patchCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(patchCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] patchCoefficient.fulfilled:', action.payload);
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
        console.error('[coefficientSlice] patchCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deleteCoefficient.pending, (state) => {
        console.log('[coefficientSlice] deleteCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] deleteCoefficient.fulfilled:', action.payload);
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteCoefficient.rejected, (state, action) => {
        console.error('[coefficientSlice] deleteCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Activate =====
    builder
      .addCase(activateCoefficient.pending, (state) => {
        console.log('[coefficientSlice] activateCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(activateCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] activateCoefficient.fulfilled:', action.payload);
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
        console.error('[coefficientSlice] activateCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Deactivate =====
    builder
      .addCase(deactivateCoefficient.pending, (state) => {
        console.log('[coefficientSlice] deactivateCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] deactivateCoefficient.fulfilled:', action.payload);
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
        console.error('[coefficientSlice] deactivateCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Active =====
    builder
      .addCase(fetchActiveCoefficients.pending, (state) => {
        console.log('[coefficientSlice] fetchActiveCoefficients.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCoefficients.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchActiveCoefficients.fulfilled:', action.payload);
        state.loading = false;
        state.activeCoefficients = action.payload;
      })
      .addCase(fetchActiveCoefficients.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchActiveCoefficients.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Apply Coefficient =====
    builder
      .addCase(applyCoefficient.pending, (state) => {
        console.log('[coefficientSlice] applyCoefficient.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoefficient.fulfilled, (state, action) => {
        console.log('[coefficientSlice] applyCoefficient.fulfilled:', action.payload);
        state.loading = false;
        state.applyResult = action.payload;
      })
      .addCase(applyCoefficient.rejected, (state, action) => {
        console.error('[coefficientSlice] applyCoefficient.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By Department =====
    builder
      .addCase(fetchCoefficientsByDepartment.pending, (state) => {
        console.log('[coefficientSlice] fetchCoefficientsByDepartment.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByDepartment.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchCoefficientsByDepartment.fulfilled:', action.payload);
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByDepartment.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchCoefficientsByDepartment.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By Position =====
    builder
      .addCase(fetchCoefficientsByPosition.pending, (state) => {
        console.log('[coefficientSlice] fetchCoefficientsByPosition.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByPosition.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchCoefficientsByPosition.fulfilled:', action.payload);
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByPosition.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchCoefficientsByPosition.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch By User =====
    builder
      .addCase(fetchCoefficientsByUser.pending, (state) => {
        console.log('[coefficientSlice] fetchCoefficientsByUser.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoefficientsByUser.fulfilled, (state, action) => {
        console.log('[coefficientSlice] fetchCoefficientsByUser.fulfilled:', action.payload);
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoefficientsByUser.rejected, (state, action) => {
        console.error('[coefficientSlice] fetchCoefficientsByUser.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const coefficientReducer = coefficientSlice.reducer;
export const coefficientActions = coefficientSlice.actions;
export const resetCoefficientState = coefficientSlice.actions.resetState;
export const setCoefficientFilters = coefficientSlice.actions.setFilters;
export const clearCoefficientFilters = coefficientSlice.actions.clearFilters;
export const setCoefficientPagination = coefficientSlice.actions.setPagination;
export default coefficientReducer;
