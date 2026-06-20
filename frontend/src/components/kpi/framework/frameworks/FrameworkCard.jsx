import React from 'react';
import { FiEdit, FiTrash2, FiCopy, FiCheckCircle, FiArchive, FiEye } from 'react-icons/fi';
import KPIStatusBadge from '../../common/KPIStatusBadge';

const FrameworkCard = ({ framework, onEdit, onDelete, onPublish, onArchive, onDuplicate, canManage, onView }) => {
    const getStatusIcon = () => {
        switch (framework.status) {
            case 'PUBLISHED': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'ARCHIVED': return <FiArchive size={14} color="var(--kpi-gray-500)" />;
            default: return null;
        }
    };

    return (
        <div className="kpi-framework-card" onClick={() => onView?.(framework)}>
            <div className="kpi-framework-card-header">
                <div className="kpi-framework-card-title">
                    <h3>{framework.name}</h3>
                    {getStatusIcon()}
                </div>
                <KPIStatusBadge status={framework.status} />
            </div>
            
            <div className="kpi-framework-card-content">
                <div className="kpi-framework-card-code">
                    Code: {framework.code}
                </div>
                <div className="kpi-framework-card-version">
                    Version: {framework.version}
                </div>
                <div className="kpi-framework-card-description">
                    {framework.description}
                </div>
                <div className="kpi-framework-card-stats">
                    <span>{framework.kpi_count || 0} KPIs</span>
                    {framework.is_default && <span className="default-badge">Default</span>}
                </div>
            </div>
            
            {canManage && (
                <div className="kpi-framework-card-actions">
                    {framework.status === 'DRAFT' && (
                        <button onClick={(e) => { e.stopPropagation(); onPublish(); }} title="Publish">
                            <FiCheckCircle size={14} />
                            Publish
                        </button>
                    )}
                    {framework.status === 'PUBLISHED' && (
                        <button onClick={(e) => { e.stopPropagation(); onArchive(); }} title="Archive">
                            <FiArchive size={14} />
                            Archive
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate">
                        <FiCopy size={14} />
                        Duplicate
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">
                        <FiEdit size={14} />
                        Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">
                        <FiTrash2 size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default FrameworkCard;