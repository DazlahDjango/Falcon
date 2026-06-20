import React from 'react';
import { FiArrowLeft, FiEdit, FiTrash2, FiCheckCircle, FiCopy, FiStar } from 'react-icons/fi';
import KPILoading from '../../common/KPILoading';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const TemplateDetail = ({ template, loading, onBack, onEdit, onDelete, onPublish, onUse, canManage }) => {
    if (loading) {
        return <KPILoading text="Loading template details..." />;
    }

    if (!template) return null;

    const getDifficultyColor = () => {
        switch (template.difficulty) {
            case 'BEGINNER': return 'var(--kpi-success)';
            case 'INTERMEDIATE': return 'var(--kpi-warning)';
            case 'ADVANCED': return 'var(--kpi-danger)';
            default: return 'var(--kpi-gray-500)';
        }
    };

    return (
        <div className="kpi-template-detail">
            <div className="kpi-template-detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Templates
                </button>
                <div className="actions">
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
            
            <div className="kpi-template-detail-content">
                <div className="kpi-template-detail-info">
                    <h1>{template.name}</h1>
                    <div className="kpi-template-detail-meta">
                        <span className="code">{template.code}</span>
                        <KPIStatusBadge status={template.is_published ? 'published' : 'draft'} />
                    </div>
                    <div className="kpi-template-detail-sector">
                        Sector: {template.sector_name}
                    </div>
                    <div className="kpi-template-detail-difficulty">
                        Difficulty: <span style={{ color: getDifficultyColor() }}>{template.difficulty}</span>
                    </div>
                    <div className="kpi-template-detail-description">
                        {template.description}
                    </div>
                    <div className="kpi-template-detail-stats">
                        <FiStar size={16} />
                        <span>Used {template.usage_count || 0} times</span>
                    </div>
                </div>
                
                <div className="kpi-template-detail-definition">
                    <h3>KPI Definition Template</h3>
                    <pre>{JSON.stringify(template.kpi_definition, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;