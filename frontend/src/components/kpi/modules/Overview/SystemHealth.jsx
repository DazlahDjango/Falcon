import React from 'react';
import { FiActivity, FiServer, FiDatabase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const SystemHealth = () => {
    // This would be connected to a real API endpoint
    const healthStatus = {
        database: 'healthy',
        api: 'healthy',
        cache: 'healthy',
        workers: 'healthy',
        lastCheck: new Date().toISOString(),
    };

    const getStatusIcon = (status) => {
        return status === 'healthy' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />;
    };

    const getStatusColor = (status) => {
        return status === 'healthy' ? '#10b981' : '#ef4444';
    };

    return (
        <div className="stat-section">
            <div className="section-header">
                <h3 className="section-title">
                    <FiActivity size={18} />
                    System Health
                </h3>
            </div>

            <div className="health-items">
                <div className="health-item">
                    <div className="health-icon">
                        <FiDatabase size={16} />
                    </div>
                    <span className="health-label">Database</span>
                    <span className="health-status" style={{ color: getStatusColor(healthStatus.database) }}>
                        {getStatusIcon(healthStatus.database)}
                        {healthStatus.database === 'healthy' ? 'Operational' : 'Issues Detected'}
                    </span>
                </div>
                <div className="health-item">
                    <div className="health-icon">
                        <FiServer size={16} />
                    </div>
                    <span className="health-label">API Server</span>
                    <span className="health-status" style={{ color: getStatusColor(healthStatus.api) }}>
                        {getStatusIcon(healthStatus.api)}
                        {healthStatus.api === 'healthy' ? 'Operational' : 'Issues Detected'}
                    </span>
                </div>
                <div className="health-item">
                    <div className="health-icon">
                        <FiDatabase size={16} />
                    </div>
                    <span className="health-label">Redis Cache</span>
                    <span className="health-status" style={{ color: getStatusColor(healthStatus.cache) }}>
                        {getStatusIcon(healthStatus.cache)}
                        {healthStatus.cache === 'healthy' ? 'Operational' : 'Issues Detected'}
                    </span>
                </div>
                <div className="health-item">
                    <div className="health-icon">
                        <FiActivity size={16} />
                    </div>
                    <span className="health-label">Celery Workers</span>
                    <span className="health-status" style={{ color: getStatusColor(healthStatus.workers) }}>
                        {getStatusIcon(healthStatus.workers)}
                        {healthStatus.workers === 'healthy' ? 'Operational' : 'Issues Detected'}
                    </span>
                </div>
            </div>

            <div className="health-footer">
                <span className="last-check">
                    Last check: {new Date(healthStatus.lastCheck).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

export default SystemHealth;