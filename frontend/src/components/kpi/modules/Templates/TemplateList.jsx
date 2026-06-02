import React from 'react';
import { FiEdit2, FiTrash2, FiEye, FiCopy, FiCheckCircle } from 'react-icons/fi';

const DIFFICULTY_CONFIG = {
    BEGINNER: { label: 'Beginner', color: '#10b981' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b' },
    ADVANCED: { label: 'Advanced', color: '#ef4444' },
};

const TemplateList = ({ templates, loading, onEdit, onDelete, onView, onUse }) => {
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
        <div className="template-list-view">
            <table className="template-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Sector</th>
                        <th>Difficulty</th>
                        <th>Usage</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {templates.map(template => (
                        <tr key={template.id}>
                            <td>
                                <div className="template-name-cell">
                                    <span className="template-icon-small">
                                        {DIFFICULTY_CONFIG[template.difficulty]?.icon || '📋'}
                                    </span>
                                    <span>{template.name}</span>
                                </div>
                            </td>
                            <td><code>{template.code}</code></td>
                            <td>{template.sector_name}</td>
                            <td>
                                <span className="difficulty-badge" style={{ color: DIFFICULTY_CONFIG[template.difficulty]?.color }}>
                                    {DIFFICULTY_CONFIG[template.difficulty]?.label}
                                </span>
                            </td>
                            <td>{template.usage_count || 0} times</td>
                            <td>
                                {template.is_published ? (
                                    <span className="status-badge active">
                                        <FiCheckCircle size={12} />
                                        Published
                                    </span>
                                ) : (
                                    <span className="status-badge draft">Draft</span>
                                )}
                            </td>
                            <td className="actions-cell">
                                <button
                                    className="action-btn view"
                                    onClick={() => onView(template)}
                                    title="Preview"
                                >
                                    <FiEye size={14} />
                                </button>
                                <button
                                    className="action-btn use"
                                    onClick={() => onUse(template)}
                                    title="Use Template"
                                >
                                    <FiCopy size={14} />
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={() => onEdit(template)}
                                    title="Edit"
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => onDelete(template.id)}
                                    title="Delete"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TemplateList;