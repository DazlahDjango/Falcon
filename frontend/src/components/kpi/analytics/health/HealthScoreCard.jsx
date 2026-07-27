import React from 'react';
import { FiActivity, FiCheckCircle, FiAlertCircle, FiUsers } from 'react-icons/fi';

const HealthScoreCard = ({ health }) => {
    const getHealthStatus = () => {
        const score = health?.overall_health_score || 0;
        if (score >= 90) return { label: 'Excellent', class: 'excellent', icon: <FiCheckCircle size={24} /> };
        if (score >= 75) return { label: 'Good', class: 'good', icon: <FiActivity size={24} /> };
        if (score >= 50) return { label: 'Fair', class: 'fair', icon: <FiAlertCircle size={24} /> };
        return { label: 'Poor', class: 'poor', icon: <FiAlertCircle size={24} /> };
    };
    
    const status = getHealthStatus();
    const riskLevel = health?.risk_level || 'UNKNOWN';
    
    const metrics = [
        { label: 'KPI Completion', value: health?.kpi_completion_rate || 0, suffix: '%', color: 'primary' },
        { label: 'Validation Compliance', value: health?.validation_compliance_rate || 0, suffix: '%', color: 'info' },
        { label: 'Active Employees', value: health?.active_employees || 0, suffix: '', color: 'success' },
        { label: 'Red KPIs', value: health?.red_kpi_count || 0, suffix: ` / ${health?.total_kpi_count || 0}`, color: 'danger' }
    ];
    
    return (
        <div className="analytics-card" style={{ marginBottom: 'var(--kpi-space-6)' }}>
            <div className="health-score-container">
                <div className="health-gauge">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--kpi-gray-200)" strokeWidth="12" />
                        <circle 
                            cx="100" cy="100" r="90" fill="none" 
                            stroke={status.class === 'excellent' ? 'var(--kpi-success)' : 
                                    status.class === 'good' ? 'var(--kpi-primary)' :
                                    status.class === 'fair' ? 'var(--kpi-warning)' : 'var(--kpi-danger)'}
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - (health?.overall_health_score || 0) / 100)}`}
                            transform="rotate(-90 100 100)"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="health-score-value">
                        {Number(health?.overall_health_score || 0).toFixed(1)}%
                    </div>
                </div>
                
                <div className={`health-status health-status-${status.class}`}>
                    {status.icon}
                    <span style={{ marginLeft: 8 }}>{status.label} Health</span>
                </div>
                
                <div className="health-metrics">
                    {metrics.map(metric => (
                        <div key={metric.label} className="health-metric">
                            <div className="health-metric-value" style={{ color: `var(--kpi-${metric.color})` }}>
                                {Number(metric.value || 0).toFixed(1)}{metric.suffix}
                            </div>
                            <div className="health-metric-label">{metric.label}</div>
                        </div>
                    ))}
                </div>
                
                <div style={{ marginTop: 'var(--kpi-space-4)', paddingTop: 'var(--kpi-space-4)', borderTop: '1px solid var(--kpi-gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--kpi-space-4)' }}>
                        <span>Risk Level: <strong style={{ color: riskLevel === 'HIGH' ? 'var(--kpi-danger)' : riskLevel === 'MEDIUM' ? 'var(--kpi-warning)' : 'var(--kpi-success)' }}>
                            {riskLevel}
                        </strong></span>
                        <span>Period: {health?.period}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthScoreCard;