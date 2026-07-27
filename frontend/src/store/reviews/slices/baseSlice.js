// src/store/reviews/slices/baseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Factory function to create consistent CRUD slices for reviews
 * @param {string} name - Slice name
 * @param {Object} service - Service instance with CRUD methods
 * @param {Object} options - Additional options
 */
export const createCrudSlice = (name, service, options = {}) => {
  const {
    listParams = {},
    transformResponse = (data) => data,
    extraReducers = {},
  } = options;

  // Async Thunks
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const response = await service.list({ ...listParams, ...params });
        const data = response && response.data !== undefined ? response.data : response;
        return transformResponse(data);
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const fetchOne = createAsyncThunk(
    `${name}/fetchOne`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await service.get(id);
        return response && response.data !== undefined ? response.data : response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const create = createAsyncThunk(
    `${name}/create`,
    async (data, { rejectWithValue }) => {
      try {
        const response = await service.create(data);
        return response && response.data !== undefined ? response.data : response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const update = createAsyncThunk(
    `${name}/update`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await service.update(id, data);
        return response && response.data !== undefined ? response.data : response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const patch = createAsyncThunk(
    `${name}/patch`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await service.patch(id, data);
        return response && response.data !== undefined ? response.data : response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  const remove = createAsyncThunk(
    `${name}/remove`,
    async (id, { rejectWithValue }) => {
      try {
        await service.delete(id);
        return id;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  // Initial State
  const initialState = {
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
    filters: {},
    sort: { field: 'created_at', order: 'desc' },
    ...options.initialState,
  };

  // Slice
  const slice = createSlice({
    name,
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
      setSort: (state, action) => {
        state.sort = action.payload;
        state.pagination.currentPage = 1;
      },
      selectItem: (state, action) => {
        state.selectedItem = action.payload;
      },
      clearSelected: (state) => {
        state.selectedItem = null;
      },
      clearErrors: (state) => {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      // Fetch All
      builder
        .addCase(fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.loading = false;
          if (Array.isArray(action.payload)) {
            state.items = action.payload;
            state.pagination.totalItems = action.payload.length;
          } else if (action.payload?.results) {
            state.items = action.payload.results;
            state.pagination.totalItems = action.payload.count || 0;
            state.pagination.totalPages = Math.ceil(
              (action.payload.count || 0) / state.pagination.pageSize
            );
          } else {
            state.items = action.payload;
          }
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch data';
        });

      // Fetch One
      builder
        .addCase(fetchOne.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchOne.fulfilled, (state, action) => {
          state.loading = false;
          state.selectedItem = action.payload;
        })
        .addCase(fetchOne.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch item';
        });

      // Create
      builder
        .addCase(create.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(create.fulfilled, (state, action) => {
          state.loading = false;
          state.items = [action.payload, ...state.items];
          state.selectedItem = action.payload;
        })
        .addCase(create.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to create item';
        });

      // Update
      builder
        .addCase(update.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(update.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedItem?.id === action.payload.id) {
            state.selectedItem = action.payload;
          }
        })
        .addCase(update.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to update item';
        });

      // Patch
      builder
        .addCase(patch.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(patch.fulfilled, (state, action) => {
          state.loading = false;
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
          }
          if (state.selectedItem?.id === action.payload.id) {
            state.selectedItem = { ...state.selectedItem, ...action.payload };
          }
        })
        .addCase(patch.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to patch item';
        });

      // Remove
      builder
        .addCase(remove.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(remove.fulfilled, (state, action) => {
          state.loading = false;
          state.items = state.items.filter((item) => item.id !== action.payload);
          if (state.selectedItem?.id === action.payload) {
            state.selectedItem = null;
          }
        })
        .addCase(remove.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to delete item';
        });

      // Extra Reducers from options
      Object.entries(extraReducers).forEach(([actionType, reducer]) => {
        builder.addCase(actionType, reducer);
      });
    },
  });

  // Export actions and thunks
  return {
    slice,
    actions: slice.actions,
    thunks: {
      fetchAll,
      fetchOne,
      create,
      update,
      patch,
      remove,
    },
  };
};