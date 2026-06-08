import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle, FiAlertCircle, FiClock, FiServer, FiDatabase, FiActivity, FiRefreshCw } from 'react-icons/fi';

const SystemHealth = () => {
    const dispatch = useDispatch();
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const checkHealth = async () => {
        setLoading(true);
        // Simulate health check - replace with actual API call
        setTimeout(() => {
            setHealth({
                status: 'healthy',
                uptime: '14 days, 6 hours',
                version: '2.1.0',
                services: [
                    { name: 'API Server', status: 'healthy', latency: '45ms' },
                    { name: 'Database', status: 'healthy', latency: '12ms' },
                    { name: 'Redis Cache', status: 'healthy', latency: '3ms' },
                    { name: 'Celery Worker', status: 'healthy', latency: '-' },
                    { name: 'WebSocket', status: 'healthy', latency: '-' }
                ],
                metrics: {
                    cpu_usage: 32,
                    memory_usage: 48,
                    disk_usage: 27,
                    requests_per_minute: 1240
                }
            });
            setLoading(false);
        }, 1000);
    };
    
    useEffect(() => {
        checkHealth();
    }, []);
    
    const getStatusIcon = (status) => {
        if (status === 'healthy') return <FiCheckCircle size={16} color="var(--kpi-success)" />;
        if (status === 'warning') return <FiAlertCircle size={16} color="var(--kpi-warning)" />;
        return <FiAlertCircle size={16} color="var(--kpi-danger)" />;
    };
    
    const getMetricColor = (value) => {
        if (value < 70) return 'var(--kpi-success)';
        if (value < 85) return 'var(--kpi-warning)';
        return 'var(--kpi-danger)';
    };
    
    return (
        <div className="system-health">
            <div className="health-header">
                <div className="health-status">
                    <div className={`status-badge ${health?.status}`}>
                        {getStatusIcon(health?.status)}
                        System {health?.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                    </div>
                    <div className="uptime">
                        <FiClock size={14} />
                        Uptime: {health?.uptime}
                    </div>
                    <div className="version">
                        <FiServer size={14} />
                        Version: {health?.version}
                    </div>
                </div>
                <button className="refresh-health-btn" onClick={checkHealth} disabled={loading}>
                    <FiRefreshCw size={14} className={loading ? 'spin' : ''} />
                    {loading ? 'Checking...' : 'Check Health'}
                </button>
            </div>
            
            <div className="health-metrics">
                <h3>System Metrics</h3>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon"><FiActivity size={20} /></div>
                        <div className="metric-info">
                            <div className="metric-value" style={{ color: getMetricColor(health?.metrics?.cpu_usage || 0) }}>
                                {health?.metrics?.cpu_usage}%
                            </div>
                            <div className="metric-label">CPU Usage</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><FiDatabase size={20} /></div>
                        <div className="metric-info">
                            <div className="metric-value" style={{ color: getMetricColor(health?.metrics?.memory_usage || 0) }}>
                                {health?.metrics?.memory_usage}%
                            </div>
                            <div className="metric-label">Memory Usage</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><FiServer size={20} /></div>
                        <div className="metric-info">
                            <div className="metric-value" style={{ color: getMetricColor(health?.metrics?.disk_usage || 0) }}>
                                {health?.metrics?.disk_usage}%
                            </div>
                            <div className="metric-label">Disk Usage</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon"><FiActivity size={20} /></div>
                        <div className="metric-info">
                            <div className="metric-value">{health?.metrics?.requests_per_minute || 0}</div>
                            <div className="metric-label">Requests/min</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="services-status">
                <h3>Service Status</h3>
                <div className="services-list">
                    {health?.services.map((service, index) => (
                        <div key={index} className="service-item">
                            <div className="service-info">
                                <span className="service-name">{service.name}</span>
                                {service.latency !== '-' && <span className="service-latency">{service.latency}</span>}
                            </div>
                            <div className={`service-status ${service.status}`}>
                                {getStatusIcon(service.status)}
                                {service.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;