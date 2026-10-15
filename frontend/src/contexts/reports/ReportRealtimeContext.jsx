// ============================================
// frontend/src/contexts/reports/ReportRealtimeContext.jsx
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import reportsWebSocketService from '../../services/reports/websocket.service';

const ReportRealtimeContext = createContext(null);

export const ReportRealtimeProvider = ({ children, autoConnectNotifications = true }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [activeJobs, setActiveJobs] = useState({}); // { [executionId]: { progress, status, reportName, startTime } }
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [liveMetrics, setLiveMetrics] = useState(null);

    // Notification Handler
    const handleNotification = useCallback((message) => {
        if (!message) return;

        // Update active job if it is an execution progress update
        if (message.type === 'execution_progress' || message.event === 'progress') {
            const { execution_id, progress, status, report_name } = message.data || message;
            if (execution_id) {
                setActiveJobs(prev => {
                    if (status === 'completed' || status === 'failed') {
                        const next = { ...prev };
                        delete next[execution_id];
                        return next;
                    }
                    return {
                        ...prev,
                        [execution_id]: {
                            progress: progress || 0,
                            status: status || 'running',
                            reportName: report_name || 'Report Execution',
                            updatedAt: new Date().toISOString(),
                        }
                    };
                });
            }
        }

        // Update metrics if live metrics message
        if (message.type === 'live_metrics') {
            setLiveMetrics(message.data || message);
        }

        // Append to recent notifications feed
        setRecentNotifications(prev => [
            { id: Date.now() + Math.random(), timestamp: new Date().toISOString(), ...message },
            ...prev.slice(0, 49) // Keep last 50
        ]);
    }, []);

    // Initial WebSocket notification connection
    useEffect(() => {
        let mounted = true;
        if (autoConnectNotifications) {
            reportsWebSocketService.connectNotifications(
                (msg) => {
                    if (mounted) handleNotification(msg);
                },
                (err) => {
                    if (import.meta.env.DEV) console.warn('[ReportRealtimeContext] WebSocket error:', err);
                }
            ).then(() => {
                if (mounted) setIsConnected(true);
            }).catch(() => {
                if (mounted) setIsConnected(false);
            });
        }

        return () => {
            mounted = false;
            reportsWebSocketService.disconnectNotifications();
        };
    }, [autoConnectNotifications, handleNotification]);

    const clearNotifications = useCallback(() => {
        setRecentNotifications([]);
    }, []);

    const dismissJob = useCallback((jobId) => {
        setActiveJobs(prev => {
            const next = { ...prev };
            delete next[jobId];
            return next;
        });
    }, []);

    const value = useMemo(() => ({
        isConnected,
        activeJobs,
        activeJobCount: Object.keys(activeJobs).length,
        recentNotifications,
        liveMetrics,
        handleNotification,
        clearNotifications,
        dismissJob,
    }), [
        isConnected,
        activeJobs,
        recentNotifications,
        liveMetrics,
        handleNotification,
        clearNotifications,
        dismissJob,
    ]);

    return (
        <ReportRealtimeContext.Provider value={value}>
            {children}
        </ReportRealtimeContext.Provider>
    );
};

export const useReportRealtimeContext = () => {
    const context = useContext(ReportRealtimeContext);
    if (!context) {
        throw new Error('useReportRealtimeContext must be used within a ReportRealtimeProvider');
    }
    return context;
};

export default ReportRealtimeContext;
