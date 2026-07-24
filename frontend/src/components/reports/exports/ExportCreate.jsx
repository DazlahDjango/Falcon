// frontend/src/components/reports/exports/ExportCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFile, FiLock, FiShield } from 'react-icons/fi';
import { useExports, useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './exports.css';

export const ExportCreate = () => {
    const navigate = useNavigate();
    const { create, loading, error, clearErrors } = useExports({ autoFetch: false });
    const { fetchList: fetchReports, reports } = useReports({ autoFetch: false });

    const [formData, setFormData] = useState({
        report_id: '',
        format: 'pdf',
        password: '',
        encrypt: false,
        watermark: '',
        params: {},
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchReports({ pageSize: 100 });
    }, [fetchReports]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await create(formData);
            if (result) {
                navigate(`/reports/exports/${result.export_id || result.id}`);
            }
        } catch (err) {
            console.error('Failed to create export:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (formData.report_id) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports/exports');
        }
    };

    const formats = [
        { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: '📄' },
        { value: 'excel', label: 'Excel', description: 'Microsoft Excel Spreadsheet', icon: '📊' },
        { value: 'csv', label: 'CSV', description: 'Comma Separated Values', icon: '📋' },
        { value: 'json', label: 'JSON', description: 'JSON Data Format', icon: '📝' },
        { value: 'pptx', label: 'PowerPoint', description: 'PowerPoint Presentation', icon: '📑' },
        { value: 'html', label: 'HTML', description: 'HTML Document', icon: '🌐' },
        { value: 'xml', label: 'XML', description: 'XML Data Format', icon: '📄' },
    ];

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create export"
            />
        );
    }

    return (
        <div className="export-form-container">
            <div className="export-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">New Export</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.report_id}
                >
                    <FiDownload size={18} />
                    {isSubmitting ? 'Exporting...' : 'Export'}
                </button>
            </div>

            <form className="export-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Report Selection</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="report_id">Select Report *</label>
                            <select
                                id="report_id"
                                value={formData.report_id}
                                onChange={(e) => handleChange('report_id', e.target.value)}
                                required
                            >
                                <option value="">Select a report...</option>
                                {reports.map((report) => (
                                    <option key={report.id} value={report.id}>
                                        {report.name} ({report.report_type}) - {report.status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Format Selection</h3>
                    <div className="format-grid">
                        {formats.map((format) => (
                            <button
                                key={format.value}
                                type="button"
                                className={`format-option ${formData.format === format.value ? 'active' : ''}`}
                                onClick={() => handleChange('format', format.value)}
                            >
                                <span className="format-icon">{format.icon}</span>
                                <span className="format-label">{format.label}</span>
                                <span className="format-description">{format.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <FiFile size={16} />
                        Export Options
                    </h3>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.encrypt}
                                    onChange={(e) => handleChange('encrypt', e.target.checked)}
                                />
                                <FiShield size={14} />
                                Encrypt Export
                            </label>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="password">
                                <FiLock size={14} />
                                Password (optional)
                            </label>
                            <input
                                id="password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Enter password to protect the export"
                                disabled={!formData.encrypt}
                            />
                            <small className="helper-text">
                                {formData.encrypt ? 'Password will be required to open the export' : 'Enable encryption to set a password'}
                            </small>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="watermark">Watermark Text (optional)</label>
                            <input
                                id="watermark"
                                type="text"
                                value={formData.watermark}
                                onChange={(e) => handleChange('watermark', e.target.value)}
                                placeholder="e.g., Confidential, Draft, For Review"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Parameters</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="params">Parameters (JSON)</label>
                            <textarea
                                id="params"
                                value={JSON.stringify(formData.params, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleChange('params', parsed);
                                    } catch {
                                        // Invalid JSON
                                    }
                                }}
                                rows={4}
                                className="code-editor"
                                placeholder="{}"
                            />
                            <small className="helper-text">
                                Additional parameters to pass to the report generation
                            </small>
                        </div>
                    </div>
                </div>
            </form>

            <ReportConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Discard"
                confirmVariant="danger"
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    navigate('/reports/exports');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};