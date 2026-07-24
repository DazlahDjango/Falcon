// frontend/src/components/reports/shares/ShareAccess.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiDownload, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import { useShares } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import { ShareStatusBadge } from './ShareStatusBadge';
import './shares.css';

export const ShareAccess = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [accessData, setAccessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { accessShare } = useShares({ autoFetch: false });

    useEffect(() => {
        if (token) {
            handleAccess(null);
        }
    }, [token]);

    const handleAccess = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await accessShare(token, password || null);
            if (result?.report) {
                setAccessData(result);
                setShowPassword(false);
            } else if (result?.requires_password) {
                setShowPassword(true);
                setError('Password required');
            } else {
                setError('Failed to access shared report');
            }
        } catch (err) {
            setError(err.message || 'Failed to access shared report');
        } finally {
            setLoading(false);
        }
    };

    const getPermissionIcon = (permission) => {
        const icons = {
            view: <FiEye size={16} />,
            comment: <FiMessageSquare size={16} />,
            edit: <FiEdit2 size={16} />,
            export: <FiDownload size={16} />,
        };
        return icons[permission] || <FiEye size={16} />;
    };

    const getPermissionLabel = (permission) => {
        const labels = {
            view: 'View Only',
            comment: 'View & Comment',
            edit: 'View, Comment & Edit',
            export: 'Full Access',
        };
        return labels[permission] || permission;
    };

    if (loading) {
        return <ReportLoading variant="spinner" text="Accessing shared report..." />;
    }

    if (error && !showPassword) {
        return (
            <ReportError
                error={error}
                onRetry={handleAccess}
                title="Access Failed"
            />
        );
    }

    if (showPassword) {
        return (
            <div className="share-access-container">
                <div className="share-access-card">
                    <div className="access-icon">🔒</div>
                    <h2>Password Required</h2>
                    <p>This shared report is password protected.</p>
                    <form onSubmit={handleAccess} className="password-form">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="password-input"
                            autoFocus
                        />
                        {error && <span className="error-text">{error}</span>}
                        <button type="submit" className="btn btn-primary">
                            <FiLock size={16} />
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (!accessData?.report) {
        return (
            <ReportError
                error="Invalid or expired share link"
                title="Share Not Found"
            />
        );
    }

    const { report, permission } = accessData;

    return (
        <div className="share-access-container">
            <div className="share-access-header">
                <h1 className="share-access-title">Shared Report</h1>
                <ShareStatusBadge
                    isActive={true}
                    isExpired={false}
                    size="medium"
                />
            </div>

            <div className="share-access-content">
                <div className="report-preview">
                    <div className="report-header">
                        <h2 className="report-name">{report.name}</h2>
                        <div className="report-meta">
                            <span className="meta-item">
                                <span className="meta-label">Type:</span>
                                <span className="meta-value">{report.report_type}</span>
                            </span>
                            <span className="meta-item">
                                <span className="meta-label">Status:</span>
                                <span className="meta-value">{report.status}</span>
                            </span>
                            <span className="meta-item">
                                <span className="meta-label">Last Generated:</span>
                                <span className="meta-value">
                                    {report.last_generated_at
                                        ? new Date(report.last_generated_at).toLocaleString()
                                        : 'Never'}
                                </span>
                            </span>
                        </div>
                    </div>

                    {report.description && (
                        <div className="report-description">
                            <p>{report.description}</p>
                        </div>
                    )}

                    <div className="permission-indicator">
                        <span className="permission-icon">{getPermissionIcon(permission)}</span>
                        <span className="permission-label">
                            You have <strong>{getPermissionLabel(permission)}</strong> access
                        </span>
                    </div>

                    <div className="report-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/reports/${report.id}/view`)}
                        >
                            <FiEye size={16} />
                            View Report
                        </button>
                        {(permission === 'export' || permission === 'edit') && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/reports/${report.id}/export`)}
                            >
                                <FiDownload size={16} />
                                Export
                            </button>
                        )}
                        {permission === 'edit' && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/reports/${report.id}/edit`)}
                            >
                                <FiEdit2 size={16} />
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                <div className="share-info">
                    <div className="info-card">
                        <h4>Share Details</h4>
                        <div className="info-row">
                            <span className="info-label">Access Type</span>
                            <span className="info-value">{accessData.share_type || 'Shared'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Permission</span>
                            <span className="info-value">{getPermissionLabel(permission)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Shared By</span>
                            <span className="info-value">
                                {accessData.shared_by?.name || accessData.shared_by?.email || 'Unknown'}
                            </span>
                        </div>
                        {accessData.message && (
                            <div className="info-row">
                                <span className="info-label">Message</span>
                                <span className="info-value message-text">{accessData.message}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};