import React from 'react';
import { FiHeart, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const OrganizationHealth = ({ health }) => {
    const getHealthStatus = () => {
        const score = health?.overall_score || 0;
        if (score >= 90) return { label: 'Excellent', icon: <FiCheckCircle size={20} />, color: '#10b981', class: 'excellent' };
        if (score >= 75) return { label: 'Good', icon: <FiHeart size={20} />, color: '#3b82f6', class: 'good' };
        if (score >= 50) return { label: 'Fair', icon: <FiAlertTriangle size={20} />, color: '#f59e0b', class: 'fair' };
        return { label: 'Poor', icon: <FiXCircle size={20} />, color: '#ef4444', class: 'poor' };
    };
    
    const status = getHealthStatus();
    
    const metrics = [
        { label: 'KPI Completion', value: health?.kpi_completion_rate || 0, suffix: '%' },
        { label: 'Validation Rate', value: health?.validation_compliance_rate || 0, suffix: '%' },
        { label: 'Active KPIs', value: health?.active_kpi_count || 0, suffix: '' },
        { label: 'Avg Score', value: health?.average_score || 0, suffix: '%' }
    ];
    
    return (
        <div className="org-health-card">
            <div className="org-health-header">
                <h3>Organization Health</h3>
                <div className={`health-badge ${status.class}`}>
                    {status.icon}
                    {status.label}
                </div>
            </div>
            <div className="org-health-content">
                <div className="health-gauge">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        <circle 
                            cx="80" cy="80" r="70" fill="none" 
                            stroke={status.color}
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - (health?.overall_score || 0) / 100)}`}
                            transform="rotate(-90 80 80)"
                            strokeLinecap="round"
                        />
                        <text x="80" y="75" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                            {health?.overall_score || 0}%
                        </text>
                        <text x="80" y="95" textAnchor="middle" fontSize="10" fill="#6b7280">Health</text>
                    </svg>
                </div>
                <div className="health-metrics">
                    {metrics.map((metric, index) => (
                        <div key={index} className="health-metric">
                            <div className="metric-value">{metric.value}{metric.suffix}</div>
                            <div className="metric-label">{metric.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrganizationHealth;