import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFile, FiLoader } from 'react-icons/fi';
import { useReport } from '../../../hooks/reports';
import { exportService } from '../../../services/reports';
import { ReportLoading, ReportError } from '../common';
import './reports.css';

const FORMAT_EXTENSION_MAP = {
    pdf: 'pdf',
    excel: 'xlsx',
    csv: 'csv',
    json: 'json',
    pptx: 'pptx',
    html: 'html',
    xml: 'xml',
};

const FORMAT_MIME_TYPES = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv;charset=utf-8;',
    json: 'application/json',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    html: 'text/html;charset=utf-8;',
    xml: 'application/xml',
};

export const ReportExport = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        report,
        loading,
        error,
        exportReport,
        clearErrors,
    } = useReport(id, { autoFetch: true });

    const [format, setFormat] = useState('pdf');
    const [isExporting, setIsExporting] = useState(false);
    const [result, setResult] = useState(null);

    const formats = [
        { value: 'pdf', label: 'PDF', icon: '📄' },
        { value: 'excel', label: 'Excel', icon: '📊' },
        { value: 'csv', label: 'CSV', icon: '📋' },
        { value: 'json', label: 'JSON', icon: '📝' },
        { value: 'pptx', label: 'PowerPoint', icon: '📑' },
        { value: 'html', label: 'HTML', icon: '🌐' },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await exportReport(id, {
                format,
                params: {},
                password: '',
                encrypt: false,
            });
            setResult(response);
        } catch (err) {
            console.error('Export failed:', err);
            setResult({ error: err.message || 'Export failed' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownload = async () => {
        try {
            const fileExt = FORMAT_EXTENSION_MAP[format] || format;
            const mimeType = FORMAT_MIME_TYPES[format] || 'application/octet-stream';
            const fileName = `${report?.name || 'report'}_export.${fileExt}`;

            const exportId = result?.export_id || result?.id;
            if (exportId) {
                const response = await exportService.downloadExport(exportId);
                const blob = new Blob([response.data], {
                    type: response.headers?.['content-type'] || mimeType
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else if (result?.data || result) {
                const content = result?.data || result;
                const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
                    type: mimeType,
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const handleBack = () => {
        navigate(`/reports/${id}`);
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
        <div className="report-export-container">
            <div className="report-export-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Report
                </button>
                <h1 className="page-title">Export Report: {report.name}</h1>
            </div>

            <div className="report-export-content">
                <div className="export-info">
                    <div className="info-card">
                        <h3>Export Options</h3>
                        <div className="form-group">
                            <label htmlFor="format">Format</label>
                            <div className="format-grid">
                                {formats.map((fmt) => (
                                    <button
                                        key={fmt.value}
                                        className={`format-btn ${format === fmt.value ? 'active' : ''}`}
                                        onClick={() => setFormat(fmt.value)}
                                    >
                                        <span className="format-icon">{fmt.icon}</span>
                                        <span className="format-label">{fmt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Export Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Report</span>
                                <span className="value">{report.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Format</span>
                                <span className="value">
                                    {formats.find((f) => f.value === format)?.label || format}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Status</span>
                                <span className="value">{report.status}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Type</span>
                                <span className="value">{report.report_type}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="export-actions">
                    <button
                        className="btn btn-primary export-btn"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <FiLoader size={18} className="spinning" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <FiDownload size={18} />
                                Export Report
                            </>
                        )}
                    </button>
                </div>

                {result && (
                    <div className="result-container">
                        <h3>Export Result</h3>
                        {result.error ? (
                            <div className="result-error">
                                <span className="error-icon">❌</span>
                                <p>{result.error}</p>
                            </div>
                        ) : (
                            <div className="result-success">
                                <span className="success-icon">✅</span>
                                <p>Report exported successfully!</p>
                                <div className="result-stats">
                                    <div className="stat">
                                        <span className="stat-label">Format</span>
                                        <span className="stat-value">{format}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Export ID</span>
                                        <span className="stat-value">{result.export_id}</span>
                                    </div>
                                </div>
                                <button className="btn btn-primary download-btn" onClick={handleDownload}>
                                    <FiDownload size={16} />
                                    Download Export
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};