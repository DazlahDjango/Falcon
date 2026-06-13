import React from 'react';
import { FiArrowLeft, FiEdit, FiTrash2, FiBriefcase, FiGlobe, FiBarChart2 } from 'react-icons/fi';
import KPILoading from '../../common/KPILoading';

const SectorDetail = ({ sector, loading, onBack, onEdit, onDelete, canManage }) => {
    if (loading) {
        return <KPILoading text="Loading sector details..." />;
    }

    if (!sector) return null;

    const getSectorIcon = () => {
        switch (sector.sector_type) {
            case 'COMMERCIAL': return <FiBriefcase size={32} />;
            case 'PUBLIC': return <FiGlobe size={32} />;
            default: return <FiBarChart2 size={32} />;
        }
    };

    const getSectorTypeLabel = () => {
        switch (sector.sector_type) {
            case 'COMMERCIAL': return 'Commercial / Corporate';
            case 'NGO': return 'NGO / Non-Profit';
            case 'PUBLIC': return 'Public Sector / Government';
            case 'CONSULTING': return 'Consulting / Professional Services';
            default: return sector.sector_type;
        }
    };

    return (
        <div className="kpi-sector-detail">
            <div className="kpi-sector-detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Sectors
                </button>
                {canManage && (
                    <div className="actions">
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
            
            <div className="kpi-sector-detail-content">
                <div className="kpi-sector-detail-icon">
                    {getSectorIcon()}
                </div>
                <div className="kpi-sector-detail-info">
                    <h1>{sector.name}</h1>
                    <div className="kpi-sector-detail-code">{sector.code}</div>
                    <div className="kpi-sector-detail-type">{getSectorTypeLabel()}</div>
                    <div className="kpi-sector-detail-description">{sector.description}</div>
                    <div className="kpi-sector-detail-status">
                        <span className={sector.is_active ? 'active' : 'inactive'}>
                            {sector.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectorDetail;