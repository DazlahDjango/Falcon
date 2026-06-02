import React from 'react';

const FrameworkDetail = ({ framework, onEdit, onDelete, onPublish, onArchive, onDuplicate, onBack }) => {
    const getStatusClass = () => {
        switch (framework.status) {
            case 'PUBLISHED': return 'status-published';
            case 'DRAFT': return 'status-draft';
            case 'ARCHIVED': return 'status-archived';
            default: return '';
        }
    };

    return (
        <div className="framework-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    ← Back to Frameworks
                </button>
                <div className="detail-actions">
                    {framework.status !== 'ARCHIVED' && (
                        <button className="btn-secondary" onClick={() => onEdit(framework)}>
                            ✏️ Edit
                        </button>
                    )}
                    {framework.status === 'DRAFT' && (
                        <button className="btn-success" onClick={() => onPublish(framework.id)}>
                            ✓ Publish
                        </button>
                    )}
                    {framework.status === 'PUBLISHED' && (
                        <button className="btn-warning" onClick={() => onArchive(framework.id)}>
                            📦 Archive
                        </button>
                    )}
                    <button className="btn-info" onClick={() => onDuplicate(framework.id)}>
                        📋 Duplicate
                    </button>
                    {framework.status === 'DRAFT' && (
                        <button className="btn-danger" onClick={() => onDelete(framework.id)}>
                            🗑️ Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <div className="detail-icon">
                        <span className="framework-icon-large">🏗️</span>
                    </div>
                    <div className="detail-info">
                        <h1 className="detail-title">{framework.name}</h1>
                        <div className="detail-meta">
                            <span className={`detail-status ${getStatusClass()}`}>
                                {framework.status}
                            </span>
                            <span className="detail-code">Code: {framework.code}</span>
                            <span className="detail-version">Version: {framework.version || '1.0.0'}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-stats">
                    <div className="stat-card">
                        <div className="stat-value">{framework.kpi_count || 0}</div>
                        <div className="stat-label">KPIs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{framework.category_count || 0}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{framework.sector_name || 'N/A'}</div>
                        <div className="stat-label">Sector</div>
                    </div>
                </div>

                {framework.description && (
                    <div className="detail-section">
                        <h3 className="section-title">Description</h3>
                        <p className="section-content">{framework.description}</p>
                    </div>
                )}

                <div className="detail-section">
                    <h3 className="section-title">Metadata</h3>
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="metadata-label">Created At:</span>
                            <span className="metadata-value">
                                {new Date(framework.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Last Updated:</span>
                            <span className="metadata-value">
                                {new Date(framework.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Created By:</span>
                            <span className="metadata-value">
                                {framework.created_by_name || 'System'}
                            </span>
                        </div>
                    </div>
                </div>

                {framework.metadata && Object.keys(framework.metadata).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">Additional Settings</h3>
                        <pre className="metadata-json">{JSON.stringify(framework.metadata, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrameworkDetail;