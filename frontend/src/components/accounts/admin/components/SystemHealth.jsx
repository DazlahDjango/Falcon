import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiClock } from 'react-icons/fi';

const SystemHealth = ({ health }) => {
    if (!health) {
        return (
            <div className="system-health loading">
                <p>Loading health status...</p>
            </div>
        );
    }
    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <FiCheckCircle className='Status-health' />;
            case 'degraded': return <FiAlertCircle className="status-degraded" />;
            case 'down': return <FiXCircle className="status-down" />;
            default: return <FiClock className="status-unknown" />;
        }
    };
    return (
        <div className="system-health">
            <h2>System Health</h2>
            
            <div className="health-overall">
                <div className={`health-status ${health.overall}`}>
                    {getStatusIcon(health.overall)}
                    <span>{getStatusText(health.overall)}</span>
                </div>
                <div className="health-last-check">
                    Last check: {new Date(health.last_check).toLocaleString()}
                </div>
            </div>
            
            <div className="health-components">
                <div className="component">
                    <span className="component-name">Database</span>
                    <div className={`component-status ${health.database?.status}`}>
                        {getStatusIcon(health.database?.status)}
                        <span>{getStatusText(health.database?.status)}</span>
                        {health.database?.latency && (
                            <span className="latency">{health.database.latency}ms</span>
                        )}
                    </div>
                </div>
                
                <div className="component">
                    <span className="component-name">Redis Cache</span>
                    <div className={`component-status ${health.redis?.status}`}>
                        {getStatusIcon(health.redis?.status)}
                        <span>{getStatusText(health.redis?.status)}</span>
                        {health.redis?.latency && (
                            <span className="latency">{health.redis.latency}ms</span>
                        )}
                    </div>
                </div>
                
                <div className="component">
                    <span className="component-name">Celery Worker</span>
                    <div className={`component-status ${health.celery?.status}`}>
                        {getStatusIcon(health.celery?.status)}
                        <span>{getStatusText(health.celery?.status)}</span>
                        {health.celery?.active_workers !== undefined && (
                            <span className="worker-count">{health.celery.active_workers} active</span>
                        )}
                    </div>
                </div>
                
                <div className="component">
                    <span className="component-name">Email Service</span>
                    <div className={`component-status ${health.email?.status}`}>
                        {getStatusIcon(health.email?.status)}
                        <span>{getStatusText(health.email?.status)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SystemHealth;