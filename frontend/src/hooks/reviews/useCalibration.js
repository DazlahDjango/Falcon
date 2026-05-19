// src/hooks/reviews/useCalibration.js
// Hook for calibration operations

import { useState, useEffect, useCallback } from 'react';
import { 
    calibrationSessionService, 
    calibrationRatingService, 
    calibrationCommentService 
} from '@/services/reviews';

export const useCalibration = () => {
    const [sessions, setSessions] = useState([]);
    const [mySessions, setMySessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [outlierReport, setOutlierReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========== Session Operations ==========

    // Fetch all calibration sessions
    const fetchSessions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getAll(params);
            setSessions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch calibration sessions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch my upcoming sessions
    const fetchMySessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getMySessions();
            setMySessions(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch my sessions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single session by ID
    const getSession = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getById(id);
            setCurrentSession(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create calibration session
    const createSession = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationSessionService.create(data);
            await fetchSessions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSessions]);

    // Update calibration session
    const updateSession = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationSessionService.update(id, data);
            if (currentSession?.id === id) setCurrentSession(result);
            await fetchSessions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSessions, currentSession]);

    // Delete calibration session
    const deleteSession = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationSessionService.delete(id);
            if (currentSession?.id === id) setCurrentSession(null);
            await fetchSessions();
            await fetchMySessions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSessions, fetchMySessions, currentSession]);

    // Start session
    const startSession = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationSessionService.start(id);
            if (currentSession?.id === id) setCurrentSession(result);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to start session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [currentSession]);

    // Complete session
    const completeSession = useCallback(async (id, decisions = '', notes = '') => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationSessionService.complete(id, decisions, notes);
            if (currentSession?.id === id) setCurrentSession(result);
            await fetchSessions();
            await fetchMySessions();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to complete session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSessions, fetchMySessions, currentSession]);

    // Get session report
    const getSessionReport = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getReport(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch session report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get sessions for a cycle
    const getSessionsForCycle = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getForCycle(cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle sessions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get outlier report
    const fetchOutlierReport = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationSessionService.getOutlierReport(cycleId);
            setOutlierReport(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch outlier report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== Rating Adjustment Operations ==========

    // Adjust rating
    const adjustRating = useCallback(async (sessionId, finalRatingId, beforeScore, afterScore, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationRatingService.adjust(sessionId, finalRatingId, beforeScore, afterScore, reason);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to adjust rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get adjustments for a session
    const getAdjustmentsForSession = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationRatingService.getForSession(sessionId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch adjustments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== Comment Operations ==========

    // Add comment to session
    const addComment = useCallback(async (sessionId, comment, parentCommentId = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calibrationCommentService.add(sessionId, comment, parentCommentId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to add comment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get comments for a session
    const getCommentsForSession = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await calibrationCommentService.getForSession(sessionId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch comments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        fetchMySessions();
    }, [fetchSessions, fetchMySessions]);

    return {
        // State
        sessions,
        mySessions,
        currentSession,
        outlierReport,
        loading,
        error,
        // Session Methods
        fetchSessions,
        fetchMySessions,
        getSession,
        createSession,
        updateSession,
        deleteSession,
        startSession,
        completeSession,
        getSessionReport,
        getSessionsForCycle,
        fetchOutlierReport,
        // Rating Methods
        adjustRating,
        getAdjustmentsForSession,
        // Comment Methods
        addComment,
        getCommentsForSession,
    };
};