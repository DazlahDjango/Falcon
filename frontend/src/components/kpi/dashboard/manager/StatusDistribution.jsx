import React from 'react';
import { FiPieChart } from 'react-icons/fi';

const StatusDistribution = ({ distribution }) => {
    const items = [
        { label: 'Completed', value: distribution?.completed || 0, color: '#10b981', icon: '✅' },
        { label: 'In Progress', value: distribution?.in_progress || 0, color: '#3b82f6', icon: '🔄' },
        { label: 'At Risk', value: distribution?.at_risk || 0, color: '#f59e0b', icon: '⚠️' },
        { label: 'Not Started', value: distribution?.not_started || 0, color: '#9ca3af', icon: '⭕' }
    ];
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Goals by Status</h3>
                <FiPieChart size={16} color="var(--kpi-gray-400)" />
            </div>
            <div className="status-distribution">
                {items.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                        <div key={index} className="status-item">
                            <div className="status-header">
                                <span className="status-icon">{item.icon}</span>
                                <span className="status-label">{item.label}</span>
                                <span className="status-value">{item.value}</span>
                                <span className="status-percentage">({Number(percentage || 0).toFixed(0)}%)</span>
                            </div>
                            <div className="status-bar">
                                <div 
                                    className="status-bar-fill"
                                    style={{ width: `${percentage}%`, background: item.color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusDistribution;