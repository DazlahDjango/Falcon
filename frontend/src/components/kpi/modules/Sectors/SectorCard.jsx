import React from 'react';
import { FiEdit2, FiTrash2, FiEye, FiFolder, FiLayout, FiUsers } from 'react-icons/fi';

const SectorCard = ({ sectors, loading, onEdit, onDelete, onView }) => {
    const getSectorIcon = (sectorType) => {
        switch (sectorType) {
            case 'COMMERCIAL': return '🏢';
            case 'NGO': return '🤝';
            case 'PUBLIC': return '🏛️';
            case 'CONSULTING': return '💼';
            default: return '🏭';
        }
    };

    const getSectorColor = (sectorType) => {
        switch (sectorType) {
            case 'COMMERCIAL': return '#667eea';
            case 'NGO': return '#10b981';
            case 'PUBLIC': return '#3b82f6';
            case 'CONSULTING': return '#8b5cf6';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="sector-loading">
                <div className="spinner"></div>
                <p>Loading sectors...</p>
            </div>
        );
    }

    if (sectors.length === 0) {
        return (
            <div className="sector-empty">
                <div className="empty-icon">🏭</div>
                <h3>No Sectors Found</h3>
                <p>Create your first sector to organize KPI frameworks by industry type.</p>
            </div>
        );
    }

    return (
        <div className="sector-grid">
            {sectors.map(sector => (
                <div key={sector.id} className="sector-card" onClick={() => onView(sector)}>
                    <div className="sector-card-header">
                        <div
                            className="sector-card-icon"
                            style={{ backgroundColor: getSectorColor(sector.sector_type) }}
                        >
                            <span className="sector-icon-large">{getSectorIcon(sector.sector_type)}</span>
                        </div>
                        <div className="sector-card-badge">
                            <span className={`badge ${sector.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                {sector.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div className="sector-card-body">
                        <h3 className="sector-card-title">{sector.name}</h3>
                        <p className="sector-card-code">{sector.code}</p>
                        <p className="sector-card-description">{sector.description || 'No description provided'}</p>

                        <div className="sector-card-meta">
                            <div className="meta-item">
                                <FiFolder size={12} />
                                <span>{sector.framework_count || 0} Frameworks</span>
                            </div>
                            <div className="meta-item">
                                <FiLayout size={12} />
                                <span>{sector.template_count || 0} Templates</span>
                            </div>
                            <div className="meta-item">
                                <FiUsers size={12} />
                                <span>{sector.user_count || 0} Users</span>
                            </div>
                        </div>
                    </div>

                    <div className="sector-card-footer">
                        <button
                            className="card-btn card-btn-view"
                            onClick={(e) => { e.stopPropagation(); onView(sector); }}
                            title="View Details"
                        >
                            <FiEye size={14} />
                            View
                        </button>
                        <button
                            className="card-btn card-btn-edit"
                            onClick={(e) => { e.stopPropagation(); onEdit(sector); }}
                            title="Edit"
                        >
                            <FiEdit2 size={14} />
                            Edit
                        </button>
                        <button
                            className="card-btn card-btn-delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(sector.id); }}
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

export default SectorCard;