import React from 'react';
import { FiArrowLeft, FiEdit, FiTrash2, FiCopy, FiCheckCircle, FiArchive, FiTarget, FiFolder } from 'react-icons/fi';
import KPILoading from '../../common/KPILoading';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const FrameworkDetail = ({ framework, loading, onBack, onEdit, onDelete, onPublish, onArchive, onDuplicate, canManage }) => {
    if (loading) {
        return <KPILoading text="Loading framework details..." />;
    }

    if (!framework) return null;

    return (
        <div className="kpi-framework-detail">
            <div className="kpi-framework-detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Frameworks
                </button>
                {canManage && (
                    <div className="actions">
                        {framework.status === 'DRAFT' && (
                            <button className="publish-btn" onClick={onPublish}>
                                <FiCheckCircle size={14} />
                                Publish
                            </button>
                        )}
                        {framework.status === 'PUBLISHED' && (
                            <button className="archive-btn" onClick={onArchive}>
                                <FiArchive size={14} />
                                Archive
                            </button>
                        )}
                        <button className="duplicate-btn" onClick={onDuplicate}>
                            <FiCopy size={14} />
                            Duplicate
                        </button>
                        <button className="edit-btn" onClick={onEdit}>
                            <FiEdit size={14} />
                            Edit
                        </button>
                        <button className="delete-btn" onClick={onDelete}>
                            <FiTrash2 size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
            
            <div className="kpi-framework-detail-content">
                <div className="kpi-framework-detail-info">
                    <h1>{framework.name}</h1>
                    <div className="kpi-framework-detail-meta">
                        <span className="code">{framework.code}</span>
                        <span className="version">v{framework.version}</span>
                        <KPIStatusBadge status={framework.status} />
                    </div>
                    <div className="kpi-framework-detail-sector">
                        Sector: {framework.sector_name}
                    </div>
                    <div className="kpi-framework-detail-description">
                        {framework.description}
                    </div>
                </div>
                
                <div className="kpi-framework-detail-stats">
                    <div className="stat-card">
                        <FiTarget size={24} />
                        <div className="stat-value">{framework.kpi_count || 0}</div>
                        <div className="stat-label">Total KPIs</div>
                    </div>
                    <div className="stat-card">
                        <FiFolder size={24} />
                        <div className="stat-value">{framework.categories_count || 0}</div>
                        <div className="stat-label">Categories</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrameworkDetail;