import React from 'react';
import { FiAlertCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const RiskPredictions = ({ predictions }) => {
    const highRisk = predictions?.high_risk_count || 0;
    const recommendations = predictions?.recommendations || [];
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Risk Predictions</h3>
                {highRisk > 0 && (
                    <span className="count" style={{ background: 'var(--kpi-danger-bg)', color: 'var(--kpi-danger)' }}>
                        {highRisk} at risk
                    </span>
                )}
            </div>
            
            {highRisk > 0 && (
                <div style={{ 
                    background: 'var(--kpi-danger-bg)', 
                    padding: 'var(--kpi-space-4)', 
                    borderRadius: 'var(--kpi-radius-md)',
                    marginBottom: 'var(--kpi-space-4)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kpi-space-2)', marginBottom: 'var(--kpi-space-2)' }}>
                        <FiAlertCircle size={20} color="var(--kpi-danger)" />
                        <strong style={{ color: 'var(--kpi-danger)' }}>{highRisk} KPIs at risk of failure</strong>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--kpi-danger-dark)' }}>
                        Immediate attention required for these KPIs
                    </p>
                </div>
            )}
            
            {recommendations.length > 0 && (
                <div className="insights-list">
                    {recommendations.map((rec, index) => (
                        <div key={index} className="insight-item">
                            <div className="insight-icon insight-icon-neutral">
                                <FiTrendingUp size={14} />
                            </div>
                            <div className="insight-content">
                                <div className="insight-title">Recommendation</div>
                                <div className="insight-description">{rec}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {highRisk === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--kpi-space-6)', color: 'var(--kpi-success)' }}>
                    ✅ No high-risk KPIs detected
                </div>
            )}
        </div>
    );
};

export default RiskPredictions;