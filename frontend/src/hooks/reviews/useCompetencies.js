// src/hooks/reviews/useCompetencies.js
// Hook for competency operations

import { useState, useEffect, useCallback } from 'react';
import { 
    competencyService, 
    competencyCategoryService, 
    competencyRatingService 
} from '../../services/reviews';

export const useCompetencies = () => {
    const [competencies, setCompetencies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCompetencies, setActiveCompetencies] = useState([]);
    const [requiredCompetencies, setRequiredCompetencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========== Competency Operations ==========

    const fetchCompetencies = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyService.getAll(params);
            setCompetencies(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch competencies');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveCompetencies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyService.getActive();
            setActiveCompetencies(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch active competencies');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequiredCompetencies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyService.getRequired();
            setRequiredCompetencies(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch required competencies');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCompetency = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch competency');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCompetency = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyService.create(data);
            await fetchCompetencies();
            await fetchActiveCompetencies();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create competency');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCompetencies, fetchActiveCompetencies]);

    const updateCompetency = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyService.update(id, data);
            await fetchCompetencies();
            await fetchActiveCompetencies();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update competency');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCompetencies, fetchActiveCompetencies]);

    const deleteCompetency = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyService.delete(id);
            await fetchCompetencies();
            await fetchActiveCompetencies();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete competency');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCompetencies, fetchActiveCompetencies]);

    // ========== Category Operations ==========

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyCategoryService.getAll();
            setCategories(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch categories');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategory = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyCategoryService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch category');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyCategoryService.create(data);
            await fetchCategories();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create category');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const updateCategory = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyCategoryService.update(id, data);
            await fetchCategories();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update category');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    const deleteCategory = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyCategoryService.delete(id);
            await fetchCategories();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete category');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    // ========== Competency Rating Operations ==========

    const getRatingsForSelfAssessment = useCallback(async (assessmentId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyRatingService.getForSelfAssessment(assessmentId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch competency ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRatingsForSupervisorReview = useCallback(async (reviewId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await competencyRatingService.getForSupervisorReview(reviewId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch competency ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const bulkCreateRatings = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await competencyRatingService.bulkCreate(data);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to save competency ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompetencies();
        fetchCategories();
        fetchActiveCompetencies();
        fetchRequiredCompetencies();
    }, [fetchCompetencies, fetchCategories, fetchActiveCompetencies, fetchRequiredCompetencies]);

    return {
        // State
        competencies,
        categories,
        activeCompetencies,
        requiredCompetencies,
        loading,
        error,
        // Competency methods
        fetchCompetencies,
        getCompetency,
        createCompetency,
        updateCompetency,
        deleteCompetency,
        fetchActiveCompetencies,
        fetchRequiredCompetencies,
        // Category methods
        fetchCategories,
        getCategory,
        createCategory,
        updateCategory,
        deleteCategory,
        // Rating methods
        getRatingsForSelfAssessment,
        getRatingsForSupervisorReview,
        bulkCreateRatings,
    };
};