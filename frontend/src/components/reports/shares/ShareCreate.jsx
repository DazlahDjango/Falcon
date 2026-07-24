// frontend/src/components/reports/shares/ShareCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiMail, FiLock, FiGlobe } from 'react-icons/fi';
import { useShares, useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { SharePermissions } from './SharePermissions';
import './shares.css';

export const ShareCreate = () => {
    const navigate = useNavigate();
    const { create, loading, error, clearErrors } = useShares({ autoFetch: false });
    const { fetchList: fetchReports, reports } = useReports({ autoFetch: false });

    const [formData, setFormData] = useState({
        report: '',
        shared_with: '',
        share_type: 'internal',
        permission: 'view',
        expires_at: '',
        password: '',
        password_protected: false,
        message: '',
        include_attachments: true,
        notify_recipient: true,
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
                navigate(`/reports/shares/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to create share:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (formData.report || formData.shared_with) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports/shares');
        }
    };

    const shareTypes = [
        { value: 'internal', label: 'Internal Share', description: 'Share with internal users' },
        { value: 'external', label: 'External Share', description: 'Share with external users' },
        { value: 'public', label: 'Public Link', description: 'Anyone with the link can access' },
    ];

    const permissions = [
        { value: 'view', label: 'View Only', description: 'Can view the report' },
        { value: 'comment', label: 'View & Comment', description: 'Can view and add comments' },
        { value: 'edit', label: 'View, Comment & Edit', description: 'Can view, comment and edit' },
        { value: 'export', label: 'Full Access', description: 'Can view, comment, edit and export' },
    ];

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create share"
            />
        );
    }

    return (
        <div className="share-form-container">
            <div className="share-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Share Report</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.report}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Creating...' : 'Create Share'}
                </button>
            </div>

            <form className="share-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Report & Recipient</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="report">Select Report *</label>
                            <select
                                id="report"
                                value={formData.report}
                                onChange={(e) => handleChange('report', e.target.value)}
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
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="shared_with">
                                <FiUser size={14} />
                                Share With
                            </label>
                            <input
                                id="shared_with"
                                type="text"
                                value={formData.shared_with}
                                onChange={(e) => handleChange('shared_with', e.target.value)}
                                placeholder="User ID, email, or leave empty for public links"
                            />
                            <small className="helper-text">
                                Enter a user ID or email address. Leave empty for public shares.
                            </small>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Share Settings</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="share_type">
                                <FiGlobe size={14} />
                                Share Type *
                            </label>
                            <select
                                id="share_type"
                                value={formData.share_type}
                                onChange={(e) => handleChange('share_type', e.target.value)}
                                required
                            >
                                {shareTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label} - {type.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Permission</label>
                            <SharePermissions
                                selected={formData.permission}
                                onSelect={(value) => handleChange('permission', value)}
                                showLabel={false}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Security</h3>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.password_protected}
                                    onChange={(e) => handleChange('password_protected', e.target.checked)}
                                />
                                <FiLock size={14} />
                                Password Protect
                            </label>
                        </div>
                    </div>
                    {formData.password_protected && (
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <input
                                    id="password"
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Enter password"
                                    required={formData.password_protected}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3 className="section-title">Expiration</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expires_at">Expires At</label>
                            <input
                                id="expires_at"
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => handleChange('expires_at', e.target.value)}
                            />
                            <small className="helper-text">Leave empty for no expiration</small>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <FiMail size={14} />
                        Message & Options
                    </h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                placeholder="Add a personal message..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.include_attachments}
                                    onChange={(e) => handleChange('include_attachments', e.target.checked)}
                                />
                                Include Attachments
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.notify_recipient}
                                    onChange={(e) => handleChange('notify_recipient', e.target.checked)}
                                />
                                Notify Recipient
                            </label>
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
                    navigate('/reports/shares');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};