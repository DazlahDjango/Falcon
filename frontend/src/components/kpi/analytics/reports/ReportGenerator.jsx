import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiFileText, FiDownload, FiLoader } from 'react-icons/fi';
import ReportFilters from './ReportFilters';
import ReportPreview from './ReportPreview';
import ExportOptions from './ExportOptions';
import { createCustomReport, getReportStatus } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const ReportGenerator = () => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reportTask, setReportTask] = useState(null);
    const [reportData, setReportData] = useState({
        report_type: 'kpi_performance',
        format: 'pdf',
        filters: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            kpi_ids: [],
            department_ids: []
        }
    });
    
    const handleFilterChange = (filters) => {
        setReportData(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
    };
    
    const handleTypeChange = (reportType) => {
        setReportData(prev => ({ ...prev, report_type: reportType }));
    };
    
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await dispatch(createCustomReport({
                reportType: reportData.report_type,
                format: reportData.format,
                filters: reportData.filters
            })).unwrap();
            setReportTask(result);
            setStep(3);
            
            // Poll for status
            const pollInterval = setInterval(async () => {
                const status = await dispatch(getReportStatus(result.task_id)).unwrap();
                setReportTask(status);
                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setLoading(false);
                }
            }, 3000);
        } catch (error) {
            console.error('Failed to generate report:', error);
            setLoading(false);
        }
    };
    
    const handleExport = (format) => {
        setReportData(prev => ({ ...prev, format }));
        if (step === 2) {
            handleGenerate();
        } else {
            setStep(2);
        }
    };
    
    return (
        <div className="kpi-analytics-container">
            <div className="analytics-section-header">
                <h2>Report Generator</h2>
                <p>Create custom performance reports and analytics</p>
            </div>
            
            <div className="analytics-card">
                <div className="analytics-card-header">
                    <h3>Step {step} of 3: {step === 1 ? 'Select Report Type' : step === 2 ? 'Configure Filters' : 'Generating Report'}</h3>
                </div>
                
                <div className="report-progress" style={{ display: 'flex', gap: 'var(--kpi-space-4)', marginBottom: 'var(--kpi-space-6)' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            background: step >= 1 ? 'var(--kpi-primary)' : 'var(--kpi-gray-200)',
                            color: step >= 1 ? 'white' : 'var(--kpi-gray-500)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                        }}>1</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Type</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            background: step >= 2 ? 'var(--kpi-primary)' : 'var(--kpi-gray-200)',
                            color: step >= 2 ? 'white' : 'var(--kpi-gray-500)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                        }}>2</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Configure</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            background: step >= 3 ? 'var(--kpi-primary)' : 'var(--kpi-gray-200)',
                            color: step >= 3 ? 'white' : 'var(--kpi-gray-500)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                        }}>3</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Generate</div>
                    </div>
                </div>
                
                {step === 1 && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--kpi-space-4)', marginBottom: 'var(--kpi-space-6)' }}>
                            {[
                                { id: 'kpi_performance', name: 'KPI Performance', icon: <FiFileText size={24} />, desc: 'Detailed KPI performance report' },
                                { id: 'department_comparison', name: 'Department Comparison', icon: <FiFileText size={24} />, desc: 'Compare performance across departments' },
                                { id: 'trend_analysis', name: 'Trend Analysis', icon: <FiFileText size={24} />, desc: 'Monthly/quarterly trend analysis' }
                            ].map(type => (
                                <div 
                                    key={type.id}
                                    onClick={() => handleTypeChange(type.id)}
                                    style={{
                                        padding: 'var(--kpi-space-4)',
                                        border: `2px solid ${reportData.report_type === type.id ? 'var(--kpi-primary)' : 'var(--kpi-gray-200)'}`,
                                        borderRadius: 'var(--kpi-radius-lg)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        background: reportData.report_type === type.id ? 'var(--kpi-info-bg)' : 'white'
                                    }}
                                >
                                    <div style={{ color: 'var(--kpi-primary)', marginBottom: 'var(--kpi-space-2)' }}>{type.icon}</div>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--kpi-space-1)' }}>{type.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--kpi-gray-500)' }}>{type.desc}</div>
                                </div>
                            ))}
                        </div>
                        
                        <ExportOptions selectedFormat={reportData.format} onSelect={handleExport} />
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--kpi-space-6)' }}>
                            <button 
                                className="analytics-refresh-btn"
                                onClick={() => setStep(2)}
                            >
                                Next: Configure Filters →
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <div>
                        <ReportFilters 
                            filters={reportData.filters}
                            reportType={reportData.report_type}
                            onChange={handleFilterChange}
                        />
                        
                        <ReportPreview filters={reportData.filters} reportType={reportData.report_type} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--kpi-space-6)' }}>
                            <button 
                                className="kpi-confirm-cancel"
                                onClick={() => setStep(1)}
                            >
                                ← Back
                            </button>
                            <button 
                                className="analytics-refresh-btn"
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? <FiLoader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FiDownload size={14} />}
                                Generate Report
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 3 && reportTask && (
                    <div style={{ textAlign: 'center', padding: 'var(--kpi-space-8)' }}>
                        {reportTask.status === 'PENDING' && (
                            <>
                                <KPILoading size="md" text="Generating your report..." />
                                <p style={{ marginTop: 'var(--kpi-space-4)', color: 'var(--kpi-gray-500)' }}>
                                    This may take a few moments
                                </p>
                            </>
                        )}
                        {reportTask.status === 'COMPLETED' && (
                            <div>
                                <div style={{ fontSize: 48, marginBottom: 'var(--kpi-space-4)' }}>✅</div>
                                <h3>Report Ready!</h3>
                                <p style={{ marginBottom: 'var(--kpi-space-6)', color: 'var(--kpi-gray-500)' }}>
                                    Your report has been generated successfully
                                </p>
                                <a 
                                    href={reportTask.result_url} 
                                    download
                                    className="analytics-refresh-btn"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                    <FiDownload size={14} />
                                    Download Report
                                </a>
                            </div>
                        )}
                        {reportTask.status === 'FAILED' && (
                            <div>
                                <div style={{ fontSize: 48, marginBottom: 'var(--kpi-space-4)' }}>❌</div>
                                <h3>Generation Failed</h3>
                                <p style={{ color: 'var(--kpi-danger)' }}>{reportTask.error_message || 'An error occurred'}</p>
                                <button 
                                    className="analytics-refresh-btn"
                                    onClick={() => setStep(2)}
                                    style={{ marginTop: 'var(--kpi-space-4)' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportGenerator;