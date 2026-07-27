// frontend/src/components/reports/templates/TemplateApply.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useTemplate, useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import './templates.css';

export const TemplateApply = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        template,
        loading,
        error,
        fetchOne,
        applyTemplate,
        clearErrors,
    } = useTemplate(id, { autoFetch: true });

    const { fetchList: fetchReports, reports } = useReports({ autoFetch: false });

    const [selectedReport, setSelectedReport] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyResult, setApplyResult] = useState(null);

    useEffect(() => {
        fetchReports({ pageSize: 100 });
    }, [fetchReports]);

    const handleApply = async () => {
        if (!selectedReport) return;
        setIsApplying(true);
        try {
            const result = await applyTemplate(id, selectedReport);
            setApplyResult(result);
        } catch (err) {
            console.error('Failed to apply template:', err);
            setApplyResult({ error: err.message || 'Failed to apply template' });
        } finally {
            setIsApplying(false);
        }
    };

    const handleBack = () => {
        navigate(`/reports/templates/${id}`);
    };

    const handleViewReport = () => {
        if (selectedReport) {
            navigate(`/reports/${selectedReport}`);
        }
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading template..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load template"
            />
        );
    }

    if (!template) {
        return <ReportError error="Template not found" title="Template not found" />;
    }

    const getTypeLabel = (type) => {
        const labels = {
            executive: 'Executive Dashboard',
            departmental: 'Departmental Scorecard',
            kpi: 'KPI Report',
            mission: 'Mission Status Report',
            compliance: 'Compliance Report',
            trend: 'Trend Analysis',
            comparative: 'Comparative Analysis',
            pip: 'PIP Report',
            custom: 'Custom Template',
        };
        return labels[type] || type;
    };

    return (
        <div className="template-apply-container">
            <div className="template-apply-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Template
                </button>
                <h1 className="page-title">Apply Template: {template.name}</h1>
            </div>

            <div className="template-apply-content">
                <div className="apply-info">
                    <div className="info-card">
                        <h3>Template Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Name</span>
                                <span className="value">{template.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Type</span>
                                <span className="value">{getTypeLabel(template.template_type)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Sector</span>
                                <span className="value">{template.sector || 'All Sectors'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Version</span>
                                <span className="value">v{template.version || 1}</span>
                            </div>
                        </div>
                        {template.description && (
                            <div className="template-description">
                                <p>{template.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="info-card">
                        <h3>Select Report</h3>
                        <div className="form-group">
                            <label htmlFor="report_select">Choose a report to apply this template to:</label>
                            <select
                                id="report_select"
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                className="report-select"
                            >
                                <option value="">Select a report...</option>
                                {reports.map((report) => (
                                    <option key={report.id} value={report.id}>
                                        {report.name} ({report.report_type})
                                    </option>
                                ))}
                            </select>
                            {reports.length === 0 && (
                                <div className="no-reports-notice">
                                    <FiAlertCircle size={16} />
                                    <span>No reports available. Create a report first.</span>
                                </div>
                            )}
                        </div>

                        <div className="template-features">
                            <h4>Template Features</h4>
                            <div className="features-list">
                                <div className="feature-item">
                                    <span className="feature-check">
                                        {template.has_prebuilt_charts ? '✅' : '❌'}
                                    </span>
                                    <span>Prebuilt Charts</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-check">
                                        {template.has_dynamic_filters ? '✅' : '❌'}
                                    </span>
                                    <span>Dynamic Filters</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-check">
                                        {template.has_parameters ? '✅' : '❌'}
                                    </span>
                                    <span>Parameters</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="apply-actions">
                    <button
                        className="btn btn-primary apply-btn"
                        onClick={handleApply}
                        disabled={isApplying || !selectedReport}
                    >
                        <FiCheck size={18} />
                        {isApplying ? 'Applying...' : 'Apply Template'}
                    </button>
                </div>

                {applyResult && (
                    <div className="apply-result-container">
                        <h3>Apply Result</h3>
                        {applyResult.error ? (
                            <div className="result-error">
                                <span className="error-icon">❌</span>
                                <p>{applyResult.error}</p>
                            </div>
                        ) : (
                            <div className="result-success">
                                <span className="success-icon">✅</span>
                                <p>Template applied successfully!</p>
                                <div className="result-actions">
                                    <button className="btn btn-primary" onClick={handleViewReport}>
                                        View Report
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleBack}>
                                        Back to Template
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};