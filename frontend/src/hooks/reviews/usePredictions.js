// src/hooks/reviews/usePredictions.js
// Hook for fetching and managing flight risk predictions

import { useState, useCallback, useEffect } from 'react';
import { predictionService } from '../../services/reviews';
import { RISK_LEVELS } from '../../config/constants/reviewConstants';

export const usePredictions = (options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [highRiskEmployees, setHighRiskEmployees] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [riskLevelFilter, setRiskLevelFilter] = useState(options.riskLevel || null);
    const [departmentFilter, setDepartmentFilter] = useState(options.departmentId || null);

    /**
     * Fetch all predictions
     */
    const fetchPredictions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (riskLevelFilter) filters.risk_level = riskLevelFilter;
            if (departmentFilter) filters.department_id = departmentFilter;
            
            const data = await predictionService.getPredictions({
                ...filters,
                ...params
            });
            const results = data?.results || data?.predictions || data;
            setPredictions(Array.isArray(results) ? results : []);
            setTotalCount(data?.count || (Array.isArray(results) ? results.length : 0));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setPredictions([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [riskLevelFilter, departmentFilter]);

    /**
     * Fetch high risk employees only
     */
    const fetchHighRiskEmployees = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (departmentFilter) filters.department_id = departmentFilter;
            
            const data = await predictionService.getHighRiskEmployees({
                ...filters,
                ...params
            });
            const results = data?.results || data?.employees || data;
            setHighRiskEmployees(Array.isArray(results) ? results : []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setHighRiskEmployees([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [departmentFilter]);

    /**
     * Fetch specific employee risk assessment
     */
    const fetchEmployeeRisk = useCallback(async (employeeId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await predictionService.getEmployeeRisk(employeeId, params);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Filter by risk level
     */
    const filterByRiskLevel = useCallback((riskLevel) => {
        setRiskLevelFilter(riskLevel);
    }, []);

    /**
     * Filter by department
     */
    const filterByDepartment = useCallback((departmentId) => {
        setDepartmentFilter(departmentId);
    }, []);

    /**
     * Clear all filters
     */
    const clearFilters = useCallback(() => {
        setRiskLevelFilter(null);
        setDepartmentFilter(null);
    }, []);

    /**
     * Export predictions
     */
    const exportPredictions = useCallback(async (format = 'pdf', params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const filters = {};
            if (riskLevelFilter) filters.risk_level = riskLevelFilter;
            if (departmentFilter) filters.department_id = departmentFilter;
            
            const blob = await predictionService.exportPredictions(format, {
                ...filters,
                ...params
            });
            return blob;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [riskLevelFilter, departmentFilter]);

    /**
     * Get count of employees by risk level
     */
    const getRiskLevelCounts = useCallback(() => {
        const counts = {
            [RISK_LEVELS.LOW]: 0,
            [RISK_LEVELS.MEDIUM]: 0,
            [RISK_LEVELS.HIGH]: 0,
            [RISK_LEVELS.CRITICAL]: 0
        };
        
        predictions.forEach(pred => {
            if (counts[pred.risk_level] !== undefined) {
                counts[pred.risk_level]++;
            }
        });
        
        return counts;
    }, [predictions]);

    // Auto-fetch on mount or filter change
    useEffect(() => {
        fetchPredictions();
        fetchHighRiskEmployees();
    }, [fetchPredictions, fetchHighRiskEmployees]);

    return {
        loading,
        error,
        predictions,
        highRiskEmployees,
        totalCount,
        riskLevelFilter,
        departmentFilter,
        fetchPredictions,
        fetchHighRiskEmployees,
        fetchEmployeeRisk,
        filterByRiskLevel,
        filterByDepartment,
        clearFilters,
        exportPredictions,
        getRiskLevelCounts
    };
};

export default usePredictions;