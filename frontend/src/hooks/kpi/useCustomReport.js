import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createCustomReport,
    getReportStatus,
    selectReportTask,
    selectAnalyticsLoading
} from '../../store/kpi';

const useCustomReport = () => {
    const dispatch = useDispatch();
    const [polling, setPolling] = useState(false);
    const [pollInterval, setPollInterval] = useState(null);
    const reportTask = useSelector(selectReportTask);
    const loading = useSelector(selectAnalyticsLoading);
    
    const createReport = useCallback(async (reportType, format = 'pdf', filters = {}) => {
        return dispatch(createCustomReport({ reportType, format, filters })).unwrap();
    }, [dispatch]);
    
    const checkStatus = useCallback(async (taskId) => {
        return dispatch(getReportStatus(taskId)).unwrap();
    }, [dispatch]);
    
    const pollStatus = useCallback((taskId, onComplete, interval = 3000) => {
        if (pollInterval) clearInterval(pollInterval);
        
        setPolling(true);
        const intervalId = setInterval(async () => {
            try {
                const status = await checkStatus(taskId);
                if (status.status === 'COMPLETED') {
                    clearInterval(intervalId);
                    setPolling(false);
                    if (onComplete) onComplete(status);
                } else if (status.status === 'FAILED') {
                    clearInterval(intervalId);
                    setPolling(false);
                }
            } catch (error) {
                clearInterval(intervalId);
                setPolling(false);
            }
        }, interval);
        
        setPollInterval(intervalId);
    }, [checkStatus, pollInterval]);
    
    const stopPolling = useCallback(() => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
            setPolling(false);
        }
    }, [pollInterval]);
    
    return {
        reportTask,
        loading,
        polling,
        createReport,
        checkStatus,
        pollStatus,
        stopPolling,
        isReady: reportTask?.status === 'COMPLETED',
        resultUrl: reportTask?.result_url,
    };
};

export default useCustomReport;