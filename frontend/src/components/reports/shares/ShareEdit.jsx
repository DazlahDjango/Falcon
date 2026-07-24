// frontend/src/components/reports/shares/ShareEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiLock } from 'react-icons/fi';
import { useShare } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { SharePermissions } from './SharePermissions';
import './shares.css';

export const ShareEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        share,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useShare(id, { autoFetch: true });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (share) {
            setFormData({
                permission: share.permission || 'view',
                expires_at: share.expires_at || '',
                is_active: share.is_active !== undefined ? share.is_active : true,
                password: share.password || '',
                password_protected: share.password_protected || false,
                message: share.message || '',
                include_attachments: share.include_attachments !== undefined ? share.include_attachments : true,
            });
        }
    }, [share]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        try {
            await update(id, formData);
            navigate(`/reports/shares/${id}`);
        } catch (err) {
            console.error('Failed to update share:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate(`/reports/shares/${id}`);
        }
    };

    const hasChanges = () => {
        if (!share || !formData) return false;
        return JSON.stringify(share) !== JSON.stringify({ ...share, ...formData });
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading share..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load share"
            />
        );
    }

    if (!share || !formData) {
        return <ReportError error="Share not found" title="Share not found" />;
    }

    const permissions = [
        { value: 'view', label: 'View Only' },
        { value: 'comment', label: 'View & Comment' },
        { value: 'edit', label: 'View, Comment & Edit' },
        { value: 'export', label: 'Full Access' },
    ];

    return (
        <div className="share-form-container">
            <div className="share-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Edit Share</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form className="share-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Share Details</h3>
                    <div className="info-row">
                        <span className="info-label">Report</span>
                        <span className="info-value">{share.report_name || share.report || 'Unknown'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Shared With</span>
                        <span className="info-value">
                            {share.shared_with?.name || share.shared_with?.email || 'Public'}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Share Type</span>
                        <span className="info-value">{share.share_type}</span>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Settings</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Permission</label>
                            <select
                                value={formData.permission}
                                onChange={(e) => handleChange('permission', e.target.value)}
                                className="permission-select"
                            >
                                {permissions.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="expires_at">Expires At</label>
                            <input
                                id="expires_at"
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => handleChange('expires_at', e.target.value)}
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
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3 className="section-title">Message & Options</h3>
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
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                />
                                Active
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
                    navigate(`/reports/shares/${id}`);
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};