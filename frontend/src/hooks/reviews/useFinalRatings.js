// src/hooks/reviews/useFinalRatings.js
// Hook for final rating operations

import { useState, useEffect, useCallback } from 'react';
import { finalRatingService } from '@/services/reviews';

export const useFinalRatings = () => {
    const [finalRatings, setFinalRatings] = useState([]);
    const [myRating, setMyRating] = useState(null);
    const [teamRatings, setTeamRatings] = useState([]);
    const [distribution, setDistribution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all final ratings
    const fetchFinalRatings = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getAll(params);
            setFinalRatings(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch final ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get my final rating
    const fetchMyRating = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getMy();
            setMyRating(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch my rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get team ratings (managers only)
    const fetchTeamRatings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getTeam();
            setTeamRatings(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch team ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single rating by ID
    const getRating = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Approve rating (HR only)
    const approveRating = useCallback(async (id, notes = '') => {
        setLoading(true);
        setError(null);
        try {
            const result = await finalRatingService.approve(id, notes);
            await fetchFinalRatings();
            if (myRating?.id === id) await fetchMyRating();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to approve rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFinalRatings, fetchMyRating, myRating]);

    // Lock rating (final)
    const lockRating = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await finalRatingService.lock(id);
            await fetchFinalRatings();
            if (myRating?.id === id) await fetchMyRating();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to lock rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFinalRatings, fetchMyRating, myRating]);

    // Calibrate rating
    const calibrateRating = useCallback(async (id, adjustedScore, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await finalRatingService.calibrate(id, adjustedScore, reason);
            await fetchFinalRatings();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to calibrate rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFinalRatings]);

    // Get rating distribution for a cycle
    const fetchDistribution = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getDistribution(cycleId);
            setDistribution(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch rating distribution');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Export ratings
    const exportRatings = useCallback(async (cycleId, format = 'csv', includeDetails = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.export(cycleId, format, includeDetails);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to export ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get ratings for a cycle
    const getRatingsForCycle = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await finalRatingService.getForCycle(cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinalRatings();
        fetchMyRating();
    }, [fetchFinalRatings, fetchMyRating]);

    return {
        // State
        finalRatings,
        myRating,
        teamRatings,
        distribution,
        loading,
        error,
        // Methods
        fetchFinalRatings,
        fetchMyRating,
        fetchTeamRatings,
        getRating,
        approveRating,
        lockRating,
        calibrateRating,
        fetchDistribution,
        exportRatings,
        getRatingsForCycle,
    };
};