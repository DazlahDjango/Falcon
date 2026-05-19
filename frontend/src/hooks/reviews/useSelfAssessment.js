// src/hooks/reviews/useSelfAssessment.js
// Hook for self assessment operations

import { useState, useEffect, useCallback } from 'react';
import { selfAssessmentService } from '@/services/reviews';

export const useSelfAssessment = () => {
    const [myAssessment, setMyAssessment] = useState(null);
    const [teamAssessments, setTeamAssessments] = useState([]);
    const [pendingAssessments, setPendingAssessments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Get my self assessment
    const fetchMyAssessment = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await selfAssessmentService.getMy();
            setMyAssessment(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch self assessment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get team assessments (managers only)
    const fetchTeamAssessments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await selfAssessmentService.getTeam();
            setTeamAssessments(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch team assessments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get pending assessments
    const fetchPendingAssessments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await selfAssessmentService.getPending();
            setPendingAssessments(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch pending assessments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single assessment by ID
    const getAssessment = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await selfAssessmentService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch assessment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Save assessment as draft
    const saveAssessment = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await selfAssessmentService.save(data);
            if (data.id === myAssessment?.id) {
                setMyAssessment(result);
            }
            return result;
        } catch (err) {
            setError(err.message || 'Failed to save assessment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [myAssessment]);

    // Submit assessment for review
    const submitAssessment = useCallback(async (id) => {
        setSubmitting(true);
        setError(null);
        try {
            const result = await selfAssessmentService.submit(id);
            if (id === myAssessment?.id) {
                setMyAssessment(result);
            }
            return result;
        } catch (err) {
            setError(err.message || 'Failed to submit assessment');
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [myAssessment]);

    // Get assessments for a specific cycle
    const getAssessmentsForCycle = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await selfAssessmentService.getForCycle(cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle assessments');
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
            const result = await selfAssessmentService.saveRatings(id, ratings);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to save ratings');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyAssessment();
    }, [fetchMyAssessment]);

    return {
        // State
        myAssessment,
        teamAssessments,
        pendingAssessments,
        loading,
        error,
        submitting,
        // Methods
        fetchMyAssessment,
        fetchTeamAssessments,
        fetchPendingAssessments,
        getAssessment,
        saveAssessment,
        submitAssessment,
        getAssessmentsForCycle,
        saveRatings,
    };
};