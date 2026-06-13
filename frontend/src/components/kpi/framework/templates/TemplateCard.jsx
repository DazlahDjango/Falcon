import React from 'react';
import { FiEdit, FiTrash2, FiCheckCircle, FiCopy, FiStar } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const TemplateCard = ({ template, onEdit, onDelete, onPublish, onUse, canManage }) => {
    const getDifficultyColor = () => {
        switch (template.difficulty) {
            case 'BEGINNER': return 'var(--kpi-success)';
            case 'INTERMEDIATE': return 'var(--kpi-warning)';
            case 'ADVANCED': return 'var(--kpi-danger)';
            default: return 'var(--kpi-gray-500)';
        }
    };

    return (
        <div className="kpi-template-card">
            <div className="kpi-template-card-header">
                <div className="kpi-template-card-title">
                    <h3>{template.name}</h3>
                    {template.is_published && <FiCheckCircle size={14} color="var(--kpi-success)" />}
                </div>
                <KPIStatusBadge status={template.is_published ? 'published' : 'draft'} />
            </div>
            
            <div className="kpi-template-card-content">
                <div className="kpi-template-card-code">
                    Code: {template.code}
                </div>
                <div className="kpi-template-card-difficulty">
                    Difficulty: <span style={{ color: getDifficultyColor() }}>{template.difficulty}</span>
                </div>
                <div className="kpi-template-card-description">
                    {template.description}
                </div>
                <div className="kpi-template-card-stats">
                    <FiStar size={12} />
                    <span>Used {template.usage_count || 0} times</span>
                </div>
            </div>
            
            <div className="kpi-template-card-actions">
                {template.is_published ? (
                    <button className="use-btn" onClick={onUse}>
                        <FiCopy size={14} />
                        Use Template
                    </button>
                ) : canManage && (
                    <button className="publish-btn" onClick={onPublish}>
                        <FiCheckCircle size={14} />
                        Publish
                    </button>
                )}
                {canManage && (
                    <>
                        <button className="edit-btn" onClick={onEdit}>
                            <FiEdit size={14} />
                            Edit
                        </button>
                        <button className="delete-btn" onClick={onDelete}>
                            <FiTrash2 size={14} />
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TemplateCard;