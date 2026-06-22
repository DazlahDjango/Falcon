// src/store/reviews/slices/comment.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewCommentService } from '../../../services/reviews';

// ============ Thunks ============

export const fetchComments = createAsyncThunk(
  'comments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewCommentService.list(params);
      return response.results || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchComment = createAsyncThunk(
  'comments/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCommentService.get(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async (data, { rejectWithValue }) => {
    try {
      return await reviewCommentService.create(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewCommentService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const patchComment = createAsyncThunk(
  'comments/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await reviewCommentService.patch(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await reviewCommentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resolveComment = createAsyncThunk(
  'comments/resolve',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCommentService.resolve(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unresolveComment = createAsyncThunk(
  'comments/unresolve',
  async (id, { rejectWithValue }) => {
    try {
      return await reviewCommentService.unresolve(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const editComment = createAsyncThunk(
  'comments/edit',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      return await reviewCommentService.edit(id, comment);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCommentsForObject = createAsyncThunk(
  'comments/fetchForObject',
  async ({ contentType, objectId }, { rejectWithValue }) => {
    try {
      return await reviewCommentService.getForObject(contentType, objectId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCommentReplies = createAsyncThunk(
  'comments/fetchReplies',
  async (parentId, { rejectWithValue }) => {
    try {
      return await reviewCommentService.getReplies(parentId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ============ Slice ============

const initialState = {
  items: [],
  selectedItem: null,
  replies: [],
  commentsByObject: {},
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

const commentSlice = createSlice({
  name: 'comments',
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
    clearReplies: (state) => {
      state.replies = [];
    },
    clearCommentsForObject: (state) => {
      state.commentsByObject = {};
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== Fetch All =====
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
        state.pagination.totalItems = action.payload.count || state.items.length;
        state.pagination.totalPages = Math.ceil(
          (action.payload.count || state.items.length) / state.pagination.pageSize
        );
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch One =====
    builder
      .addCase(fetchComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComment.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Create =====
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
        state.selectedItem = action.payload;
        // Add to commentsByObject if applicable
        const key = `${action.payload.content_type}_${action.payload.object_id}`;
        if (state.commentsByObject[key]) {
          state.commentsByObject[key] = [action.payload, ...state.commentsByObject[key]];
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Update =====
    builder
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update in commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          const idx = state.commentsByObject[key].findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            state.commentsByObject[key][idx] = action.payload;
          }
        });
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Patch =====
    builder
      .addCase(patchComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = { ...state.selectedItem, ...action.payload };
        }
        // Update in commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          const idx = state.commentsByObject[key].findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            state.commentsByObject[key][idx] = { ...state.commentsByObject[key][idx], ...action.payload };
          }
        });
      })
      .addCase(patchComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Delete =====
    builder
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        // Remove from commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          state.commentsByObject[key] = state.commentsByObject[key].filter(
            (item) => item.id !== action.payload
          );
        });
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Resolve =====
    builder
      .addCase(resolveComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update in commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          const idx = state.commentsByObject[key].findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            state.commentsByObject[key][idx] = action.payload;
          }
        });
      })
      .addCase(resolveComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Unresolve =====
    builder
      .addCase(unresolveComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unresolveComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update in commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          const idx = state.commentsByObject[key].findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            state.commentsByObject[key][idx] = action.payload;
          }
        });
      })
      .addCase(unresolveComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Edit =====
    builder
      .addCase(editComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        // Update in commentsByObject
        Object.keys(state.commentsByObject).forEach((key) => {
          const idx = state.commentsByObject[key].findIndex((item) => item.id === action.payload.id);
          if (idx !== -1) {
            state.commentsByObject[key][idx] = action.payload;
          }
        });
      })
      .addCase(editComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch For Object =====
    builder
      .addCase(fetchCommentsForObject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsForObject.fulfilled, (state, action) => {
        state.loading = false;
        const key = `${action.meta.arg.contentType}_${action.meta.arg.objectId}`;
        state.commentsByObject[key] = action.payload;
        state.items = action.payload;
      })
      .addCase(fetchCommentsForObject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ===== Fetch Replies =====
    builder
      .addCase(fetchCommentReplies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentReplies.fulfilled, (state, action) => {
        state.loading = false;
        state.replies = action.payload;
      })
      .addCase(fetchCommentReplies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const reviewCommentReducer = commentSlice.reducer;
export const reviewCommentActions = commentSlice.actions;
export const resetCommentState = commentSlice.actions.resetState;
export default reviewCommentReducer;