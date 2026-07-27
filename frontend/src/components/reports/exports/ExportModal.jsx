// frontend/src/components/reports/exports/ExportModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiDownload, FiLock, FiShield, FiFile } from 'react-icons/fi';
import { useExports, useReports } from '../../../hooks/reports';
import './exports.css';

export const ExportModal = ({
    isOpen = false,
    onClose,
    onSuccess,
    defaultReportId = '',
    className = '',
}) => {
    const [formData, setFormData] = useState({
        report_id: defaultReportId || '',
        format: 'pdf',
        password: '',
        encrypt: false,
        watermark: '',
        params: {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { create, loading, clearErrors } = useExports({ autoFetch: false });
    const { fetchList: fetchReports, reports } = useReports({ autoFetch: false });

    useEffect(() => {
        if (isOpen) {
            fetchReports({ pageSize: 100 });
            if (defaultReportId) {
                setFormData((prev) => ({ ...prev, report_id: defaultReportId }));
            }
        }
    }, [isOpen, defaultReportId, fetchReports]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.report_id) {
            setError('Please select a report');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await create(formData);
            if (result?.export_id || result?.id) {
                onSuccess?.(result);
                onClose();
            } else {
                setError('Export failed: No export ID returned');
            }
        } catch (err) {
            setError(err.message || 'Export failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        clearErrors();
        setError(null);
        onClose();
    };

    const formats = [
        { value: 'pdf', label: 'PDF', icon: '📄' },
        { value: 'excel', label: 'Excel', icon: '📊' },
        { value: 'csv', label: 'CSV', icon: '📋' },
        { value: 'json', label: 'JSON', icon: '📝' },
        { value: 'pptx', label: 'PowerPoint', icon: '📑' },
        { value: 'html', label: 'HTML', icon: '🌐' },
    ];

    if (!isOpen) return null;

    return (
        <div className="export-modal-overlay" onClick={handleClose}>
            <div className={`export-modal ${className}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        <FiDownload size={20} />
                        Export Report
                    </h3>
                    <button className="modal-close" onClick={handleClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="modal_report">Select Report *</label>
                        <select
                            id="modal_report"
                            value={formData.report_id}
                            onChange={(e) => handleChange('report_id', e.target.value)}
                            required
                        >
                            <option value="">Select a report...</option>
                            {reports.map((report) => (
                                <option key={report.id} value={report.id}>
                                    {report.name} ({report.report_type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Format</label>
                        <div className="format-options">
                            {formats.map((format) => (
                                <button
                                    key={format.value}
                                    type="button"
                                    className={`format-option ${formData.format === format.value ? 'active' : ''}`}
                                    onClick={() => handleChange('format', format.value)}
                                >
                                    <span className="format-icon">{format.icon}</span>
                                    <span className="format-label">{format.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

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

                    {formData.encrypt && (
                        <div className="form-group">
                            <label htmlFor="modal_password">
                                <FiLock size={14} />
                                Password
                            </label>
                            <input
                                id="modal_password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="modal_watermark">
                            <FiFile size={14} />
                            Watermark (optional)
                        </label>
                        <input
                            id="modal_watermark"
                            type="text"
                            value={formData.watermark}
                            onChange={(e) => handleChange('watermark', e.target.value)}
                            placeholder="e.g., Confidential, Draft"
                        />
                    </div>

                    {error && (
                        <div className="modal-error">
                            <span className="error-icon">❌</span>
                            <span className="error-message">{error}</span>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={handleClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !formData.report_id}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinning">⟳</span>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FiDownload size={16} />
                                    Export
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ExportModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func,
    defaultReportId: PropTypes.string,
    className: PropTypes.string,
};