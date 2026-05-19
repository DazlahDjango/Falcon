// src/hooks/reviews/useFeedback.js
// Hook for feedback operations

import { useState, useEffect, useCallback } from 'react';
import { feedbackRequestService, feedbackResponseService, feedbackSummaryService } from '@/services/reviews';

export const useFeedback = () => {
    const [requests, setRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [mySummary, setMySummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========== Feedback Request Operations ==========

    // Fetch all feedback requests
    const fetchRequests = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackRequestService.getAll(params);
            setRequests(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch feedback requests');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch pending requests for current user
    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackRequestService.getPending();
            setPendingRequests(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch pending requests');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single request by ID
    const getRequest = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackRequestService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch request');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create feedback request
    const createRequest = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackRequestService.create(data);
            await fetchRequests();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create feedback request');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // Update feedback request
    const updateRequest = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackRequestService.update(id, data);
            await fetchRequests();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to update request');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // Delete feedback request
    const deleteRequest = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackRequestService.delete(id);
            await fetchRequests();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to delete request');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // Send reminder
    const sendReminder = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackRequestService.sendReminder(id);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to send reminder');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get requests for a subject
    const getRequestsForSubject = useCallback(async (subjectId, cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackRequestService.getForSubject(subjectId, cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch subject requests');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== Feedback Response Operations ==========

    // Submit feedback response
    const submitResponse = useCallback(async (requestId, data) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackResponseService.submit(requestId, data);
            await fetchPendingRequests();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to submit response');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPendingRequests]);

    // Get response for a request
    const getResponseForRequest = useCallback(async (requestId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackResponseService.getForRequest(requestId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch response');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== Feedback Summary Operations ==========

    // Get my feedback summary
    const fetchMySummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackSummaryService.getMy();
            setMySummary(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch feedback summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get summary by ID
    const getSummary = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackSummaryService.getById(id);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Share summary with subject (HR only)
    const shareSummary = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const result = await feedbackSummaryService.share(id);
            return result;
        } catch (err) {
            setError(err.message || 'Failed to share summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get summary for employee
    const getSummaryForEmployee = useCallback(async (employeeId, cycleId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await feedbackSummaryService.getForEmployee(employeeId, cycleId);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to fetch employee summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchPendingRequests();
        fetchMySummary();
    }, [fetchRequests, fetchPendingRequests, fetchMySummary]);

    return {
        // State
        requests,
        pendingRequests,
        mySummary,
        loading,
        error,
        // Request Methods
        fetchRequests,
        fetchPendingRequests,
        getRequest,
        createRequest,
        updateRequest,
        deleteRequest,
        sendReminder,
        getRequestsForSubject,
        // Response Methods
        submitResponse,
        getResponseForRequest,
        // Summary Methods
        fetchMySummary,
        getSummary,
        shareSummary,
        getSummaryForEmployee,
    };
};