// src/hooks/reviews/useReviewComments.js
// Hook for review comment operations

import { useState, useCallback } from 'react';
import { reviewCommentService } from '@/services/reviews';

export const useReviewComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch comments for a parent object
    const fetchComments = useCallback(async (parentType, parentId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reviewCommentService.getForParent(parentType, parentId);
            setComments(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch comments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Add a comment
    const addComment = useCallback(async (parentType, parentId, comment, commentType = 'general', visibility = 'public', parentCommentId = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewCommentService.add(parentType, parentId, comment, commentType, visibility, parentCommentId);
            await fetchComments(parentType, parentId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to add comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchComments]);

    // Update a comment
    const updateComment = useCallback(async (id, comment, parentType, parentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewCommentService.update(id, comment);
            await fetchComments(parentType, parentId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchComments]);

    // Delete a comment
    const deleteComment = useCallback(async (id, parentType, parentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewCommentService.delete(id);
            await fetchComments(parentType, parentId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchComments]);

    // Resolve a comment
    const resolveComment = useCallback(async (id, parentType, parentId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reviewCommentService.resolve(id);
            await fetchComments(parentType, parentId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to resolve comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchComments]);

    return {
        comments,
        loading,
        error,
        fetchComments,
        addComment,
        updateComment,
        deleteComment,
        resolveComment,
    };
};