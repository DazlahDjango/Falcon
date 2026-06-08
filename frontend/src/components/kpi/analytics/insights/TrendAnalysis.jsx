import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const TrendAnalysis = ({ insights }) => {
    const trend = insights?.trend;
    const isPositive = trend?.direction === 'improving';
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Performance Trend</h3>
                <span className={`analytics-stat-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑ Improving' : '↓ Declining'}
                </span>
            </div>
            
            <div style={{ textAlign: 'center', padding: 'var(--kpi-space-4)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 'var(--kpi-space-2)' }}>
                    {trend?.current_score?.toFixed(1) || 0}%
                </div>
                <div style={{ color: 'var(--kpi-gray-500)', marginBottom: 'var(--kpi-space-4)' }}>
                    Previous: {trend?.previous_score?.toFixed(1) || 0}%
                </div>
                
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--kpi-space-2)',
                    padding: 'var(--kpi-space-3)', background: 'var(--kpi-gray-50)', borderRadius: 'var(--kpi-radius-md)'
                }}>
                    {isPositive ? <FiTrendingUp size={20} color="var(--kpi-success)" /> : <FiTrendingDown size={20} color="var(--kpi-danger)" />}
                    <span style={{ fontWeight: 500 }}>
                        Change: {Math.abs(trend?.change || 0).toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TrendAnalysis;