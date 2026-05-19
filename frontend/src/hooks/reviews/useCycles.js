// src/hooks/reviews/useCycles.js
// Hook for review cycle operations

import { useState, useEffect, useCallback } from 'react';
import { cycleService } from '@/services/reviews';

export const useCycles = () => {
    const [cycles, setCycles] = useState([]);
    const [activeCycle, setActiveCycle] = useState(null);
    const [upcomingCycles, setUpcomingCycles] = useState([]);
    const [myCycles, setMyCycles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(null);

    // Fetch all cycles
    const fetchCycles = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getAll(params);
            setCycles(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycles');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch active cycle
    const fetchActiveCycle = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getActive();
            setActiveCycle(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch active cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch upcoming cycles
    const fetchUpcomingCycles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getUpcoming();
            setUpcomingCycles(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch upcoming cycles');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch my cycles
    const fetchMyCycles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getMyCycles();
            setMyCycles(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch my cycles');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single cycle by ID
    const getCycle = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get cycle progress
    const fetchCycleProgress = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await cycleService.getProgress(id);
            setProgress(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch cycle progress');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create cycle
    const createCycle = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.create(data);
            await fetchCycles();
            await fetchUpcomingCycles();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles, fetchUpcomingCycles]);

    // Update cycle
    const updateCycle = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.update(id, data);
            await fetchCycles();
            if (activeCycle?.id === id) await fetchActiveCycle();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles, fetchActiveCycle, activeCycle]);

    // Delete cycle
    const deleteCycle = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.delete(id);
            await fetchCycles();
            await fetchUpcomingCycles();
            if (activeCycle?.id === id) await fetchActiveCycle();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles, fetchUpcomingCycles, fetchActiveCycle, activeCycle]);

    // Activate cycle
    const activateCycle = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.activate(id);
            await fetchCycles();
            await fetchActiveCycle();
            await fetchUpcomingCycles();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to activate cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles, fetchActiveCycle, fetchUpcomingCycles]);

    // Close cycle
    const closeCycle = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.close(id);
            await fetchCycles();
            await fetchActiveCycle();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to close cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles, fetchActiveCycle]);

    // Archive cycle
    const archiveCycle = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.archive(id);
            await fetchCycles();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to archive cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCycles]);

    // Add competencies to cycle
    const addCompetenciesToCycle = useCallback(async (id, competencies) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.addCompetencies(id, competencies);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to add competencies to cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Remove competency from cycle
    const removeCompetencyFromCycle = useCallback(async (cycleId, competencyId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await cycleService.removeCompetency(cycleId, competencyId);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to remove competency from cycle');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCycles();
        fetchActiveCycle();
        fetchUpcomingCycles();
        fetchMyCycles();
    }, [fetchCycles, fetchActiveCycle, fetchUpcomingCycles, fetchMyCycles]);

    return {
        // State
        cycles,
        activeCycle,
        upcomingCycles,
        myCycles,
        loading,
        error,
        progress,
        // Methods
        fetchCycles,
        fetchActiveCycle,
        fetchUpcomingCycles,
        fetchMyCycles,
        getCycle,
        fetchCycleProgress,
        createCycle,
        updateCycle,
        deleteCycle,
        activateCycle,
        closeCycle,
        archiveCycle,
        addCompetenciesToCycle,
        removeCompetencyFromCycle,
    };
};