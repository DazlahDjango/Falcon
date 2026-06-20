import React from 'react';
import { FiEye } from 'react-icons/fi';

const ReportPreview = ({ filters, reportType }) => {
    const getPreviewDescription = () => {
        switch (reportType) {
            case 'kpi_performance':
                return `KPI Performance Report for ${filters.month}/${filters.year}${filters.kpi_ids?.length ? ` with ${filters.kpi_ids.length} selected KPIs` : ''}`;
            case 'department_comparison':
                return `Department Comparison Report for ${filters.month}/${filters.year}${filters.department_ids?.length ? ` comparing ${filters.department_ids.length} departments` : ''}`;
            case 'trend_analysis':
                return `Trend Analysis Report over selected period`;
            default:
                return 'Performance Report';
        }
    };
    
    return (
        <div style={{ 
            background: 'var(--kpi-gray-50)', 
            borderRadius: 'var(--kpi-radius-lg)', 
            padding: 'var(--kpi-space-4)',
            marginTop: 'var(--kpi-space-4)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kpi-space-2)', marginBottom: 'var(--kpi-space-3)' }}>
                <FiEye size={16} />
                <strong>Preview</strong>
            </div>
            <p style={{ color: 'var(--kpi-gray-600)', fontSize: '0.875rem' }}>
                {getPreviewDescription()}
            </p>
        </div>
    );
};

export default ReportPreview;