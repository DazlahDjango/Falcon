// src/hooks/reviews/usePIPs.js
// Hook for PIP operations (includes PIPs, actions, and reviews)

import { useState, useEffect, useCallback } from 'react';
import { pipService, pipActionService, pipReviewService } from '@/services/reviews';

export const usePIPs = () => {
    const [pips, setPips] = useState([]);
    const [myPIPs, setMyPIPs] = useState([]);
    const [teamPIPs, setTeamPIPs] = useState([]);
    const [activePIPs, setActivePIPs] = useState([]);
    const [overduePIPs, setOverduePIPs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(null);

    // ========== PIP Operations ==========

    // Fetch all PIPs
    const fetchPIPs = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getAll(params);
            setPips(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIPs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get my PIPs
    const fetchMyPIPs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getMy();
            setMyPIPs(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch my PIPs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get team PIPs (managers only)
    const fetchTeamPIPs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getTeam();
            setTeamPIPs(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch team PIPs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get active PIPs
    const fetchActivePIPs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getActive();
            setActivePIPs(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch active PIPs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get overdue PIPs
    const fetchOverduePIPs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getOverdue();
            setOverduePIPs(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch overdue PIPs');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single PIP by ID
    const getPIP = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get PIP progress
    const fetchPIPProgress = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getProgress(id);
            setProgress(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIP progress');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create PIP
    const createPIP = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.create(data);
            await fetchPIPs();
            await fetchMyPIPs();
            await fetchActivePIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchMyPIPs, fetchActivePIPs]);

    // Update PIP
    const updatePIP = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.update(id, data);
            await fetchPIPs();
            await fetchMyPIPs();
            await fetchTeamPIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchMyPIPs, fetchTeamPIPs]);

    // Delete PIP
    const deletePIP = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.delete(id);
            await fetchPIPs();
            await fetchMyPIPs();
            await fetchTeamPIPs();
            await fetchActivePIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchMyPIPs, fetchTeamPIPs, fetchActivePIPs]);

    // Approve PIP
    const approvePIP = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.approve(id);
            await fetchPIPs();
            await fetchTeamPIPs();
            await fetchActivePIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to approve PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchTeamPIPs, fetchActivePIPs]);

    // Extend PIP
    const extendPIP = useCallback(async (id, newEndDate, reason) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.extend(id, newEndDate, reason);
            await fetchPIPs();
            await fetchTeamPIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to extend PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchTeamPIPs]);

    // Complete PIP
    const completePIP = useCallback(async (id, outcome, notes = '') => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.complete(id, outcome, notes);
            await fetchPIPs();
            await fetchMyPIPs();
            await fetchTeamPIPs();
            await fetchActivePIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to complete PIP');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchMyPIPs, fetchTeamPIPs, fetchActivePIPs]);

    // Generate PIP from rating
    const generatePIPFromRating = useCallback(async (ratingId, customData = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipService.generateFromRating(ratingId, customData);
            await fetchPIPs();
            await fetchTeamPIPs();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to generate PIP from rating');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPIPs, fetchTeamPIPs]);

    // Get PIP report
    const getPIPReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipService.getReport();
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIP report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== PIP Action Operations ==========

    // Get actions for a PIP
    const getActionsForPIP = useCallback(async (pipId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipActionService.getForPIP(pipId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIP actions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Complete a PIP action
    const completeAction = useCallback(async (id, evidence = null, notes = '') => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipActionService.complete(id, evidence, notes);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to complete action');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Verify a PIP action (manager only)
    const verifyAction = useCallback(async (id, verified = true) => {
        setLoading(true);
        setError(null);
        try {
            const result = await pipActionService.verify(id, verified);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to verify action');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== PIP Review Operations ==========

    // Get reviews for a PIP
    const getReviewsForPIP = useCallback(async (pipId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pipReviewService.getForPIP(pipId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch PIP reviews');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPIPs();
        fetchMyPIPs();
        fetchActivePIPs();
        fetchOverduePIPs();
    }, [fetchPIPs, fetchMyPIPs, fetchActivePIPs, fetchOverduePIPs]);

    return {
        // State
        pips,
        myPIPs,
        teamPIPs,
        activePIPs,
        overduePIPs,
        loading,
        error,
        progress,
        // PIP Methods
        fetchPIPs,
        fetchMyPIPs,
        fetchTeamPIPs,
        fetchActivePIPs,
        fetchOverduePIPs,
        getPIP,
        fetchPIPProgress,
        createPIP,
        updatePIP,
        deletePIP,
        approvePIP,
        extendPIP,
        completePIP,
        generatePIPFromRating,
        getPIPReport,
        // Action Methods
        getActionsForPIP,
        completeAction,
        verifyAction,
        // Review Methods
        getReviewsForPIP,
    };
};