// src/hooks/reviews/useSupervisorReview.js
// Hook for supervisor review operations

import { useState, useEffect, useCallback } from 'react';
import { supervisorReviewService } from '@/services/reviews';

export const useSupervisorReview = () => {
    const [reviewQueue, setReviewQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [approving, setApproving] = useState(false);

    // Get manager's review queue
    const fetchReviewQueue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supervisorReviewService.getQueue();
            setReviewQueue(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch review queue');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single review by ID
    const getReview = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await supervisorReviewService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch review');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save review as draft
    const saveReview = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await supervisorReviewService.save(data);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to save review');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Submit review
    const submitReview = useCallback(async (id) => {
        setSubmitting(true);
        setError(null);
        try {
            const result = await supervisorReviewService.submit(id);
            await fetchReviewQueue();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [fetchReviewQueue]);

    // Approve review (HR only)
    const approveReview = useCallback(async (id) => {
        setApproving(true);
        setError(null);
        try {
            const result = await supervisorReviewService.approve(id);
            await fetchReviewQueue();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to approve review');
            throw err;
        } finally {
            setApproving(false);
        }
    }, [fetchReviewQueue]);

    // Reject review (HR only)
    const rejectReview = useCallback(async (id, reason) => {
        setApproving(true);
        setError(null);
        try {
            const result = await supervisorReviewService.reject(id, reason);
            await fetchReviewQueue();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to reject review');
            throw err;
        } finally {
            setApproving(false);
        }
    }, [fetchReviewQueue]);

    // Get review for specific employee
    const getReviewForEmployee = useCallback(async (employeeId, cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await supervisorReviewService.getForEmployee(employeeId, cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch employee review');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get reviews for a cycle
    const getReviewsForCycle = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await supervisorReviewService.getForCycle(cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle reviews');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save competency ratings
    const saveRatings = useCallback(async (id, ratings) => {
        setLoading(true);
        setError(null);
        try {
            const result = await supervisorReviewService.saveRatings(id, ratings);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to save ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get comparison with self assessment
    const getComparison = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await supervisorReviewService.getComparison(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch comparison');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviewQueue();
    }, [fetchReviewQueue]);

    return {
        // State
        reviewQueue,
        loading,
        error,
        submitting,
        approving,
        // Methods
        fetchReviewQueue,
        getReview,
        saveReview,
        submitReview,
        approveReview,
        rejectReview,
        getReviewForEmployee,
        getReviewsForCycle,
        saveRatings,
        getComparison,
    };
};