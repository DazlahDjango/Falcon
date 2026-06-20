// src/hooks/reviews/useReports.js
// Hook for report generation operations

import { useState, useCallback } from 'react';
import { reportService } from '@/services/reviews';

export const useReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);

    // Get employee summary report
    const getEmployeeSummary = useCallback(async (employeeId, cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getEmployeeSummary(employeeId, cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate employee summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get team summary report
    const getTeamSummary = useCallback(async (managerId, cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getTeamSummary(managerId, cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate team summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get cycle summary report
    const getCycleSummary = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getCycleSummary(cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate cycle summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get PIP summary report
    const getPIPSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getPIPSummary();
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate PIP summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get calibration summary report
    const getCalibrationSummary = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getCalibrationSummary(cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate calibration summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get rating distribution report
    const getRatingDistribution = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getRatingDistribution(cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate rating distribution');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get organization strategic report
    const getOrganizationStrategicReport = useCallback(async (cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getOrganizationSummary(cycleId);
            setReportData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to generate organization strategic report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Export report
    const exportReport = useCallback(async (reportType, cycleId, format = 'csv') => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.export(reportType, cycleId, format);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to export report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reportData,
        loading,
        error,
        getEmployeeSummary,
        getTeamSummary,
        getCycleSummary,
        getPIPSummary,
        getCalibrationSummary,
        getRatingDistribution,
        getOrganizationStrategicReport,
        exportReport,
    };
};