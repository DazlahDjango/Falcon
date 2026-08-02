// frontend/src/components/reports/reports/ReportGenerate.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiDownload, FiLoader } from 'react-icons/fi';
import { useReport } from '../../../hooks/reports';
import { REPORT_TYPE_LABELS } from '../../../config/constants/reportConstants';
import { ReportLoading, ReportError } from '../common';
import './reports.css';

export const ReportGenerate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        report,
        loading,
        error,
        generate,
        clearErrors,
    } = useReport(id, { autoFetch: true });

    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setProgress(0);
        try {
            const interval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 500);

            const response = await generate(id, {
                async_mode: false,
                params: {},
            });

            clearInterval(interval);
            setProgress(100);
            setResult(response);
        } catch (err) {
            console.error('Generation failed:', err);
            setResult({ error: err.message || 'Generation failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        navigate(`/reports/${id}`);
    };

    const handleDownload = () => {
        if (result?.data) {
            const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report?.name || 'report'}_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading report..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to load report"
            />
        );
    }

    if (!report) {
        return <ReportError error="Report not found" title="Report not found" />;
    }

    return (
        <div className="report-generate-container">
            <div className="report-generate-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Report
                </button>
                <h1 className="page-title">Generate Report: {report.name}</h1>
            </div>

            <div className="report-generate-content">
                <div className="generate-info">
                    <div className="info-card">
                        <h3>Report Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Name</span>
                                <span className="value">{report.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Type</span>
                                <span className="value">{REPORT_TYPE_LABELS[report.report_type] || report.report_type}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Status</span>
                                <span className="value">{report.status}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Last Generated</span>
                                <span className="value">
                                    {report.last_generated_at
                                        ? new Date(report.last_generated_at).toLocaleString()
                                        : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {report.description && (
                        <div className="info-card">
                            <h3>Description</h3>
                            <p>{report.description}</p>
                        </div>
                    )}

                    {report.parameters && Object.keys(report.parameters).length > 0 && (
                        <div className="info-card">
                            <h3>Parameters</h3>
                            <pre className="params-json">
                                {JSON.stringify(report.parameters, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="generate-actions">
                    <button
                        className="btn btn-primary generate-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <FiLoader size={18} className="spinning" />
                                Generating... {progress}%
                            </>
                        ) : (
                            <>
                                <FiPlay size={18} />
                                Generate Report
                            </>
                        )}
                    </button>

                    {result && !result.error && (
                        <button className="btn btn-secondary" onClick={handleDownload}>
                            <FiDownload size={18} />
                            Download Result
                        </button>
                    )}
                </div>

                {isGenerating && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="progress-label">{progress}%</span>
                    </div>
                )}

                {result && (
                    <div className="result-container">
                        <h3>Generation Result</h3>
                        {result.error ? (
                            <div className="result-error">
                                <span className="error-icon">❌</span>
                                <p>{result.error}</p>
                            </div>
                        ) : (
                            <div className="result-success">
                                <span className="success-icon">✅</span>
                                <p>Report generated successfully!</p>
                                <div className="result-stats">
                                    <div className="stat">
                                        <span className="stat-label">Rows</span>
                                        <span className="stat-value">{result.data?.row_count || 0}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Charts</span>
                                        <span className="stat-value">{result.data?.charts?.length || 0}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Tables</span>
                                        <span className="stat-value">{result.data?.tables?.length || 0}</span>
                                    </div>
                                </div>
                                <pre className="result-preview">
                                    {JSON.stringify(result.data, null, 2).slice(0, 500)}
                                    {JSON.stringify(result.data, null, 2).length > 500 && '\n... (truncated)'}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};