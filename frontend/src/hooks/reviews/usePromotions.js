// src/hooks/reviews/usePromotions.js
// Hook for promotion recommendation operations

import { useState, useEffect, useCallback } from 'react';
import { promotionService } from '@/services/reviews';

export const usePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [myPromotions, setMyPromotions] = useState([]);
    const [teamPromotions, setTeamPromotions] = useState([]);
    const [pendingPromotions, setPendingPromotions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all promotions
    const fetchPromotions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getAll(params);
            setPromotions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch promotions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch my promotions
    const fetchMyPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getMy();
            setMyPromotions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch my promotions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch team promotions (managers only)
    const fetchTeamPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getTeam();
            setTeamPromotions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch team promotions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch pending promotions (HR/Admin only)
    const fetchPendingPromotions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getPending();
            setPendingPromotions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch pending promotions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch promotion statistics
    const fetchStats = useCallback(async (year = null) => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getStats(year);
            setStats(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch promotion stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single promotion by ID
    const getPromotion = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await promotionService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create promotion
    const createPromotion = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.create(data);
            await fetchPromotions();
            await fetchPendingPromotions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions]);

    // Update promotion
    const updatePromotion = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.update(id, data);
            await fetchPromotions();
            await fetchPendingPromotions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions]);

    // Delete promotion
    const deletePromotion = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.delete(id);
            await fetchPromotions();
            await fetchPendingPromotions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions]);

    // Approve promotion
    const approvePromotion = useCallback(async (id, notes = '') => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.approve(id, notes);
            await fetchPromotions();
            await fetchPendingPromotions();
            await fetchStats();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to approve promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions, fetchStats]);

    // Reject promotion
    const rejectPromotion = useCallback(async (id, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.reject(id, reason);
            await fetchPromotions();
            await fetchPendingPromotions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to reject promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions]);

    // Complete promotion
    const completePromotion = useCallback(async (id, actualDate, newSalary = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promotionService.complete(id, actualDate, newSalary);
            await fetchPromotions();
            await fetchPendingPromotions();
            await fetchStats();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to complete promotion');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions, fetchPendingPromotions, fetchStats]);

    useEffect(() => {
        fetchPromotions();
        fetchMyPromotions();
        fetchStats();
    }, [fetchPromotions, fetchMyPromotions, fetchStats]);

    return {
        // State
        promotions,
        myPromotions,
        teamPromotions,
        pendingPromotions,
        stats,
        loading,
        error,
        // Methods
        fetchPromotions,
        fetchMyPromotions,
        fetchTeamPromotions,
        fetchPendingPromotions,
        fetchStats,
        getPromotion,
        createPromotion,
        updatePromotion,
        deletePromotion,
        approvePromotion,
        rejectPromotion,
        completePromotion,
    };
};