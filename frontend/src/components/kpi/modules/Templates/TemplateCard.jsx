import React from 'react';
import { FiEdit2, FiTrash2, FiEye, FiCopy, FiCheckCircle } from 'react-icons/fi';

const DIFFICULTY_CONFIG = {
    BEGINNER: { label: 'Beginner', color: '#10b981', icon: '🌱' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b', icon: '📈' },
    ADVANCED: { label: 'Advanced', color: '#ef4444', icon: '🚀' },
};

const TemplateCard = ({ templates, loading, onEdit, onDelete, onView, onUse }) => {
    if (loading) {
        return (
            <div className="template-loading">
                <div className="spinner"></div>
                <p>Loading templates...</p>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="template-empty">
                <div className="empty-icon">📋</div>
                <h3>No Templates Found</h3>
                <p>Try adjusting your filters or create a new template.</p>
            </div>
        );
    }

    return (
        <div className="template-grid">
            {templates.map(template => (
                <div key={template.id} className="template-card">
                    <div className="template-card-header">
                        <div
                            className="template-card-icon"
                            style={{ backgroundColor: DIFFICULTY_CONFIG[template.difficulty]?.color + '20' }}
                        >
                            <span className="template-icon">
                                {DIFFICULTY_CONFIG[template.difficulty]?.icon || '📋'}
                            </span>
                        </div>
                        <div className="template-card-badge">
                            {template.is_published ? (
                                <span className="badge-success">
                                    <FiCheckCircle size={12} />
                                    Published
                                </span>
                            ) : (
                                <span className="badge-warning">Draft</span>
                            )}
                        </div>
                    </div>

                    <div className="template-card-body">
                        <h3 className="template-card-title">{template.name}</h3>
                        <p className="template-card-code">{template.code}</p>
                        <p className="template-card-description">{template.description || 'No description provided'}</p>

                        <div className="template-card-meta">
                            <div className="meta-item">
                                <span className="meta-label">Sector:</span>
                                <span>{template.sector_name}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Difficulty:</span>
                                <span style={{ color: DIFFICULTY_CONFIG[template.difficulty]?.color }}>
                                    {DIFFICULTY_CONFIG[template.difficulty]?.label}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Used:</span>
                                <span>{template.usage_count || 0} times</span>
                            </div>
                        </div>
                    </div>

                    <div className="template-card-footer">
                        <button
                            className="card-btn card-btn-view"
                            onClick={() => onView(template)}
                            title="View Details"
                        >
                            <FiEye size={14} />
                            Preview
                        </button>
                        <button
                            className="card-btn card-btn-use"
                            onClick={() => onUse(template)}
                            title="Use Template"
                        >
                            <FiCopy size={14} />
                            Use
                        </button>
                        <button
                            className="card-btn card-btn-edit"
                            onClick={() => onEdit(template)}
                            title="Edit"
                        >
                            <FiEdit2 size={14} />
                            Edit
                        </button>
                        <button
                            className="card-btn card-btn-delete"
                            onClick={() => onDelete(template.id)}
                            title="Delete"
                        >
                            <FiTrash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TemplateCard;