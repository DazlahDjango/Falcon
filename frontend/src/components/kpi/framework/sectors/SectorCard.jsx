import React from 'react';
import { FiEdit, FiTrash2, FiBriefcase, FiGlobe, FiBarChart2 } from 'react-icons/fi';

const SectorCard = ({ sector, onEdit, onDelete, canManage }) => {
    const getSectorIcon = () => {
        switch (sector.sector_type) {
            case 'COMMERCIAL': return <FiBriefcase size={24} />;
            case 'PUBLIC': return <FiGlobe size={24} />;
            default: return <FiBarChart2 size={24} />;
        }
    };

    const getSectorTypeLabel = () => {
        switch (sector.sector_type) {
            case 'COMMERCIAL': return 'Commercial / Corporate';
            case 'NGO': return 'NGO / Non-Profit';
            case 'PUBLIC': return 'Public Sector';
            case 'CONSULTING': return 'Consulting';
            default: return sector.sector_type;
        }
    };

    return (
        <div className="kpi-sector-card">
            <div className="kpi-sector-card-icon">
                {getSectorIcon()}
            </div>
            <div className="kpi-sector-card-content">
                <div className="kpi-sector-card-header">
                    <h3>{sector.name}</h3>
                    <span className="kpi-sector-card-code">{sector.code}</span>
                </div>
                <div className="kpi-sector-card-type">
                    {getSectorTypeLabel()}
                </div>
                <div className="kpi-sector-card-description">
                    {sector.description}
                </div>
                <div className="kpi-sector-card-stats">
                    <span className={sector.is_active ? 'active' : 'inactive'}>
                        {sector.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            {canManage && (
                <div className="kpi-sector-card-actions">
                    <button onClick={onEdit} title="Edit">
                        <FiEdit size={16} />
                    </button>
                    <button onClick={onDelete} title="Delete">
                        <FiTrash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SectorCard;