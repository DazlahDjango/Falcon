// src/store/reviews/slices/commentSlice.js
// Redux slice for review comment state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewCommentService } from '../../../services/reviews';

// ========== Async Thunks ==========

export const fetchComments = createAsyncThunk(
    'reviews/comments/fetch',
    async ({ parentType, parentId }, { rejectWithValue }) => {
        try {
            const response = await reviewCommentService.getForParent(parentType, parentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch comments');
        }
    }
);

export const addComment = createAsyncThunk(
    'reviews/comments/add',
    async ({ parentType, parentId, comment, commentType, visibility, parentCommentId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await reviewCommentService.add(parentType, parentId, comment, commentType, visibility, parentCommentId);
            await dispatch(fetchComments({ parentType, parentId }));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add comment');
        }
    }
);

export const updateComment = createAsyncThunk(
    'reviews/comments/update',
    async ({ id, comment, parentType, parentId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await reviewCommentService.update(id, comment);
            await dispatch(fetchComments({ parentType, parentId }));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update comment');
        }
    }
);

export const deleteComment = createAsyncThunk(
    'reviews/comments/delete',
    async ({ id, parentType, parentId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await reviewCommentService.delete(id);
            await dispatch(fetchComments({ parentType, parentId }));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete comment');
        }
    }
);

export const resolveComment = createAsyncThunk(
    'reviews/comments/resolve',
    async ({ id, parentType, parentId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await reviewCommentService.resolve(id);
            await dispatch(fetchComments({ parentType, parentId }));
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to resolve comment');
        }
    }
);

// ========== Initial State ==========
const initialState = {
    comments: [],
    loading: false,
    error: null,
};

// ========== Slice ==========
const commentSlice = createSlice({
    name: 'reviewsComments',
    initialState,
    reducers: {
        clearCommentError: (state) => {
            state.error = null;
        },
        clearComments: (state) => {
            state.comments = [];
        },
        clearCommentState: (state) => {
            state.comments = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                // Comment added successfully - comments already refreshed via fetchComments
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                // Comment updated successfully
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                // Comment deleted successfully
            })
            .addCase(resolveComment.fulfilled, (state, action) => {
                // Comment resolved successfully
            });
    },
});

export const {
    clearCommentError,
    clearComments,
    clearCommentState,
} = commentSlice.actions;

export default commentSlice.reducer;