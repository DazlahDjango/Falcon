import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWebhookLogs, retryWebhook, setSelectedLog, clearError } from '../../store/billing/slices/webhookSlice';
import { selectWebhookLogs, selectSelectedWebhookLog, selectWebhookPagination, selectWebhookLoading, selectWebhookError, selectWebhookStats } from '../../store/billing/selectors';

export const useWebhookService = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const hasFetched = useRef(false);
    const logs = useSelector(selectWebhookLogs) || [];
    const selectedLog = useSelector(selectSelectedWebhookLog);
    const pagination = useSelector(selectWebhookPagination) || { page: 1, pageSize: 20, total: 0 };
    const loading = useSelector(selectWebhookLoading);
    const error = useSelector(selectWebhookError);
    const stats = useSelector(selectWebhookStats);

    const fetchLogs = useCallback((params) => dispatch(fetchWebhookLogs(params)), [dispatch]);
    const retry = useCallback((id) => dispatch(retryWebhook(id)), [dispatch]);
    const selectLog = useCallback((log) => dispatch(setSelectedLog(log)), [dispatch]);
    const clearWebhookError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => {
        if (options.autoFetch && !hasFetched.current) {
            hasFetched.current = true;
            fetchLogs({ page: pagination.page, pageSize: pagination.pageSize });
        }
    }, [options.autoFetch]);

    return { logs, selectedLog, pagination, loading, error, stats, fetchLogs, retry, selectLog, clearWebhookError };
};

export default useWebhookService;