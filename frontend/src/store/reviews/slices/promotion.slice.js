// src/store/reviews/slices/promotion.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { promotionService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchPromotions = createAsyncThunk(
  'promotions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await promotionService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPromotion = createAsyncThunk(
  'promotions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await promotionService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPromotion = createAsyncThunk(
  'promotions/create',
  async (data, { rejectWithValue }) => {
    try {
      return await promotionService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePromotion = createAsyncThunk(
  'promotions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await promotionService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchPromotion = createAsyncThunk(
  'promotions/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await promotionService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await promotionService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const approvePromotion = createAsyncThunk(
  'promotions/approve',
  async ({ id, notes, targetDate }, { rejectWithValue }) => {
    try {
      return await promotionService.approve(id, notes, targetDate);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rejectPromotion = createAsyncThunk(
  'promotions/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await promotionService.reject(id, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const completePromotion = createAsyncThunk(
  'promotions/complete',
  async ({ id, actualDate, newSalary }, { rejectWithValue }) => {
    try {
      return await promotionService.complete(id, actualDate, newSalary);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const holdPromotion = createAsyncThunk(
  'promotions/hold',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await promotionService.hold(id, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingPromotions = createAsyncThunk(
  'promotions/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await promotionService.getPending();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchApprovedPromotions = createAsyncThunk(
  'promotions/fetchApproved',
  async (_, { rejectWithValue }) => {
    try {
      return await promotionService.getApproved();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompletedPromotions = createAsyncThunk(
  'promotions/fetchCompleted',
  async (_, { rejectWithValue }) => {
    try {
      return await promotionService.getCompleted();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPromotionStats = createAsyncThunk(
  'promotions/fetchStats',
  async (year = null, { rejectWithValue }) => {
    try {
      return await promotionService.getStats(year);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPromotionsForEmployee = createAsyncThunk(
  'promotions/fetchForEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      return await promotionService.getForEmployee(employeeId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePromotionFromRating = createAsyncThunk(
  'promotions/generateFromRating',
  async (ratingId, { rejectWithValue }) => {
    try {
      return await promotionService.generateFromRating(ratingId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  pending: [],
  approved: [],
  completed: [],
  stats: null,
  generatedPromotion: null,
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

const promotionSlice = createSlice({
  name: 'promotions',
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
    clearGenerated: (state) => {
      state.generatedPromotion = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update in pending/approved/completed lists
        const updateList = (list) => {
          const idx = list.findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            list[idx] = action.payload;
          }
          return list;
        };
        state.pending = updateList(state.pending);
        state.approved = updateList(state.approved);
        state.completed = updateList(state.completed);
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Patch =====
    builder
      .addCase(patchPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchPromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = { ...state.selectedItem, ...action.payload };
        }
        // Update in pending/approved/completed lists
        const updateList = (list) => {
          const idx = list.findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...action.payload };
          }
          return list;
        };
        state.pending = updateList(state.pending);
        state.approved = updateList(state.approved);
        state.completed = updateList(state.completed);
      })
      .addCase(patchPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        state.pending = state.pending.filter((item) => item.id !== action.payload);
        state.approved = state.approved.filter((item) => item.id !== action.payload);
        state.completed = state.completed.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Approve =====
    builder
      .addCase(approvePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Move from pending to approved
        state.pending = state.pending.filter((item) => item.id !== action.payload.id);
        state.approved = [action.payload, ...state.approved];
      })
      .addCase(approvePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Reject =====
    builder
      .addCase(rejectPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Remove from pending
        state.pending = state.pending.filter((item) => item.id !== action.payload.id);
      })
      .addCase(rejectPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Complete =====
    builder
      .addCase(completePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Move from approved to completed
        state.approved = state.approved.filter((item) => item.id !== action.payload.id);
        state.completed = [action.payload, ...state.completed];
      })
      .addCase(completePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Hold =====
    builder
      .addCase(holdPromotion.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(holdPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Pending =====
    builder
      .addCase(fetchPendingPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload;
      })
      .addCase(fetchPendingPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Approved =====
    builder
      .addCase(fetchApprovedPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.approved = action.payload;
      })
      .addCase(fetchApprovedPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Completed =====
    builder
      .addCase(fetchCompletedPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.completed = action.payload;
      })
      .addCase(fetchCompletedPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Stats =====
    builder
      .addCase(fetchPromotionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPromotionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch For Employee =====
    builder
      .addCase(fetchPromotionsForEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionsForEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPromotionsForEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Generate From Rating =====
    builder
      .addCase(generatePromotionFromRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePromotionFromRating.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedPromotion = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(generatePromotionFromRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const promotionReducer = promotionSlice.reducer;
export const promotionActions = promotionSlice.actions;
export const resetPromotionState = promotionSlice.actions.resetState;
