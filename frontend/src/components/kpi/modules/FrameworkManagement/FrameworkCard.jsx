import React from 'react';

const getStatusBadge = (status) => {
    switch (status) {
        case 'PUBLISHED':
            return { class: 'badge-success', text: 'Published', icon: '✓' };
        case 'DRAFT':
            return { class: 'badge-warning', text: 'Draft', icon: '📝' };
        case 'ARCHIVED':
            return { class: 'badge-secondary', text: 'Archived', icon: '📦' };
        default:
            return { class: 'badge-info', text: status, icon: 'ℹ️' };
    }
};

const FrameworkCard = ({ framework, onEdit, onDelete, onView, onPublish, onArchive, onDuplicate }) => {
    const status = getStatusBadge(framework.status);

    const handleAction = (action, e) => {
        e.stopPropagation();
        action(framework.id);
    };

    return (
        <div className="framework-card" onClick={() => onView(framework)}>
            <div className="framework-card-header">
                <div className="framework-card-icon">
                    <span className="framework-icon">🏗️</span>
                </div>
                <div className="framework-card-badge">
                    <span className={status.class}>
                        <span className="badge-icon">{status.icon}</span>
                        {status.text}
                    </span>
                </div>
            </div>

            <div className="framework-card-body">
                <h3 className="framework-card-title">{framework.name}</h3>
                <p className="framework-card-code">{framework.code}</p>
                <p className="framework-card-description">{framework.description || 'No description provided'}</p>

                <div className="framework-card-meta">
                    <span className="meta-item">
                        <span className="meta-icon">🏢</span>
                        {framework.sector_name || 'No Sector'}
                    </span>
                    <span className="meta-item">
                        <span className="meta-icon">📊</span>
                        v{framework.version || '1.0.0'}
                    </span>
                    <span className="meta-item">
                        <span className="meta-icon">📈</span>
                        {framework.kpi_count || 0} KPIs
                    </span>
                </div>
            </div>

            <div className="framework-card-footer">
                <button
                    className="card-btn card-btn-view"
                    onClick={(e) => handleAction(onView, e)}
                    title="View Details"
                >
                    👁️ View
                </button>

                {framework.status !== 'ARCHIVED' && (
                    <button
                        className="card-btn card-btn-edit"
                        onClick={(e) => handleAction(onEdit, e)}
                        title="Edit"
                    >
                        ✏️ Edit
                    </button>
                )}

                {framework.status === 'DRAFT' && (
                    <button
                        className="card-btn card-btn-publish"
                        onClick={(e) => handleAction(onPublish, e)}
                        title="Publish"
                    >
                        ✓ Publish
                    </button>
                )}

                {framework.status === 'PUBLISHED' && (
                    <button
                        className="card-btn card-btn-archive"
                        onClick={(e) => handleAction(onArchive, e)}
                        title="Archive"
                    >
                        📦 Archive
                    </button>
                )}

                <button
                    className="card-btn card-btn-duplicate"
                    onClick={(e) => handleAction(onDuplicate, e)}
                    title="Duplicate"
                >
                    📋 Duplicate
                </button>

                {framework.status === 'DRAFT' && (
                    <button
                        className="card-btn card-btn-delete"
                        onClick={(e) => handleAction(onDelete, e)}
                        title="Delete"
                    >
                        🗑️ Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default FrameworkCard;