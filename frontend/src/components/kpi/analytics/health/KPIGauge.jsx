import React from 'react';
import { FiTarget, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPIGauge = ({ health }) => {
    const completionRate = health?.kpi_completion_rate || 0;
    const complianceRate = health?.validation_compliance_rate || 0;
    const redKpiCount = health?.red_kpi_count || 0;
    const totalKpiCount = health?.total_kpi_count || 0;
    const redPercentage = totalKpiCount > 0 ? (redKpiCount / totalKpiCount) * 100 : 0;
    
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <h3>Key Metrics Gauge</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kpi-space-6)' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--kpi-space-2)' }}>
                        <span><FiTarget size={14} /> KPI Completion Rate</span>
                        <strong>{completionRate.toFixed(1)}%</strong>
                    </div>
                    <div style={{ height: 8, background: 'var(--kpi-gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--kpi-primary)' }} />
                    </div>
                </div>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--kpi-space-2)' }}>
                        <span><FiTrendingUp size={14} /> Validation Compliance</span>
                        <strong>{complianceRate.toFixed(1)}%</strong>
                    </div>
                    <div style={{ height: 8, background: 'var(--kpi-gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${complianceRate}%`, height: '100%', background: 'var(--kpi-info)' }} />
                    </div>
                </div>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--kpi-space-2)' }}>
                        <span><FiTrendingDown size={14} /> Red KPIs</span>
                        <strong>{redKpiCount} / {totalKpiCount}</strong>
                    </div>
                    <div style={{ height: 8, background: 'var(--kpi-gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${redPercentage}%`, height: '100%', background: 'var(--kpi-danger)' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIGauge;