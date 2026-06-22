import React from 'react';
import { FiAlertTriangle, FiTrendingDown, FiClock } from 'react-icons/fi';

const RiskIndicators = ({ indicators }) => {
    const riskItems = [
        { 
            label: 'High Risk KPIs', 
            value: indicators?.high_risk_count || 0, 
            icon: <FiAlertTriangle size={16} />, 
            color: '#ef4444',
            max: 100
        },
        { 
            label: 'Declining Trends', 
            value: indicators?.declining_count || 0, 
            icon: <FiTrendingDown size={16} />, 
            color: '#f59e0b',
            max: 50
        },
        { 
            label: 'Overdue Validations', 
            value: indicators?.overdue_validations || 0, 
            icon: <FiClock size={16} />, 
            color: '#f59e0b',
            max: 20
        }
    ];
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Risk Indicators</h3>
                <FiAlertTriangle size={16} color="var(--kpi-warning)" />
            </div>
            <div className="risk-indicators">
                {riskItems.map((item, index) => {
                    const percentage = (item.value / item.max) * 100;
                    const isHigh = percentage > 70;
                    return (
                        <div key={index} className="risk-item">
                            <div className="risk-header">
                                <div className="risk-icon" style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <span className="risk-label">{item.label}</span>
                                <span className={`risk-value ${isHigh ? 'high' : ''}`}>{item.value}</span>
                            </div>
                            <div className="risk-bar">
                                <div 
                                    className="risk-bar-fill"
                                    style={{ width: `${Math.min(100, percentage)}%`, background: item.color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RiskIndicators;