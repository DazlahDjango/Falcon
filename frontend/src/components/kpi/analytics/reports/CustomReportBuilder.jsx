import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlus, FiTrash2, FiSave, FiEye } from 'react-icons/fi';
import { createCustomReport } from '../../../../store/kpi';

const CustomReportBuilder = () => {
    const dispatch = useDispatch();
    const [reportConfig, setReportConfig] = useState({
        name: '',
        description: '',
        metrics: ['score', 'target', 'achievement'],
        dimensions: ['department', 'kpi'],
        filters: {},
        visualizations: ['table', 'chart']
    });
    
    const availableMetrics = [
                        { id: 'score', label: 'Score' },
                        { id: 'target', label: 'Target Value' },
                        { id: 'actual', label: 'Actual Value' },
                        { id: 'achievement', label: 'Achievement %' },
                        { id: 'trend', label: 'Trend' },
                        { id: 'status', label: 'Status' }
                    ];
    
    const availableDimensions = [
                        { id: 'department', label: 'Department' },
                        { id: 'kpi', label: 'KPI' },
                        { id: 'user', label: 'User' },
                        { id: 'month', label: 'Month' },
                        { id: 'year', label: 'Year' },
                        { id: 'category', label: 'Category' }
                    ];
    
    const addMetric = (metricId) => {
        if (!reportConfig.metrics.includes(metricId)) {
            setReportConfig(prev => ({
                ...prev,
                metrics: [...prev.metrics, metricId]
            }));
        }
    };
    
    const removeMetric = (metricId) => {
        setReportConfig(prev => ({
            ...prev,
            metrics: prev.metrics.filter(m => m !== metricId)
        }));
    };
    
    const generateReport = async () => {
        await dispatch(createCustomReport({
            reportType: 'custom',
            format: 'pdf',
            filters: reportConfig
        })).unwrap();
    };
    
    return (
        <div className="kpi-analytics-container">
            <div className="analytics-section-header">
                <h2>Custom Report Builder</h2>
                <p>Build your own custom reports with selected metrics and dimensions</p>
            </div>
            
            <div className="analytics-two-col">
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h3>Report Configuration</h3>
                    </div>
                    
                    <div style={{ marginBottom: 'var(--kpi-space-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--kpi-space-2)', fontWeight: 500 }}>Report Name</label>
                        <input 
                            type="text"
                            style={{ width: '100%', padding: 'var(--kpi-space-3)', border: '1px solid var(--kpi-gray-300)', borderRadius: 'var(--kpi-radius-md)' }}
                            value={reportConfig.name}
                            onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Q4 Performance Dashboard"
                        />
                    </div>
                    
                    <div style={{ marginBottom: 'var(--kpi-space-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--kpi-space-2)', fontWeight: 500 }}>Description</label>
                        <textarea 
                            style={{ width: '100%', padding: 'var(--kpi-space-3)', border: '1px solid var(--kpi-gray-300)', borderRadius: 'var(--kpi-radius-md)', minHeight: 80 }}
                            value={reportConfig.description}
                            onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this report shows..."
                        />
                    </div>
                    
                    <button 
                        className="analytics-refresh-btn"
                        onClick={generateReport}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <FiSave size={14} />
                        Generate Report
                    </button>
                </div>
                
                <div>
                    <div className="analytics-card" style={{ marginBottom: 'var(--kpi-space-4)' }}>
                        <div className="analytics-card-header">
                            <h3>Selected Metrics</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kpi-space-2)' }}>
                            {reportConfig.metrics.map(metricId => {
                                const metric = availableMetrics.find(m => m.id === metricId);
                                return (
                                    <div key={metricId} style={{ 
                                        background: 'var(--kpi-primary)', 
                                        color: 'white', 
                                        padding: '4px 12px', 
                                        borderRadius: 'var(--kpi-radius-full)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}>
                                        {metric?.label}
                                        <FiTrash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeMetric(metricId)} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="analytics-card">
                        <div className="analytics-card-header">
                            <h3>Add Metrics</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kpi-space-2)' }}>
                            {availableMetrics.filter(m => !reportConfig.metrics.includes(m.id)).map(metric => (
                                <div 
                                    key={metric.id}
                                    onClick={() => addMetric(metric.id)}
                                    style={{ 
                                        background: 'var(--kpi-gray-100)', 
                                        padding: '4px 12px', 
                                        borderRadius: 'var(--kpi-radius-full)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    <FiPlus size={12} />
                                    {metric.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <h3>Preview</h3>
                    <FiEye size={16} />
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--kpi-space-8)', color: 'var(--kpi-gray-500)' }}>
                    Report preview will appear here after generation
                </div>
            </div>
        </div>
    );
};

export default CustomReportBuilder;