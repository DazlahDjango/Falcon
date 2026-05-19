// src/hooks/reviews/useRatingScales.js
// Hook for rating scale operations

import { useState, useEffect, useCallback } from 'react';
import { ratingScaleService } from '@/services/reviews';

export const useRatingScales = () => {
    const [ratingScales, setRatingScales] = useState([]);
    const [defaultScale, setDefaultScale] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all rating scales
    const fetchRatingScales = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ratingScaleService.getAll(params);
            setRatingScales(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch rating scales');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch default rating scale
    const fetchDefaultScale = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ratingScaleService.getDefault();
            setDefaultScale(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch default rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single rating scale by ID
    const getRatingScale = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ratingScaleService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create rating scale
    const createRatingScale = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ratingScaleService.create(data);
            await fetchRatingScales();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRatingScales]);

    // Update rating scale
    const updateRatingScale = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ratingScaleService.update(id, data);
            await fetchRatingScales();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRatingScales]);

    // Delete rating scale
    const deleteRatingScale = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ratingScaleService.delete(id);
            await fetchRatingScales();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRatingScales]);

    // Set default rating scale
    const setDefault = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ratingScaleService.setDefault(id);
            await fetchDefaultScale();
            await fetchRatingScales();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to set default rating scale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchDefaultScale, fetchRatingScales]);

    // Convert score
    const convertScore = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ratingScaleService.convertScore(data);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to convert score');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRatingScales();
        fetchDefaultScale();
    }, [fetchRatingScales, fetchDefaultScale]);

    return {
        ratingScales,
        defaultScale,
        loading,
        error,
        fetchRatingScales,
        fetchDefaultScale,
        getRatingScale,
        createRatingScale,
        updateRatingScale,
        deleteRatingScale,
        setDefault,
        convertScore,
    };
};