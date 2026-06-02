import React from 'react';
import { FiEdit2, FiTrash2, FiEye, FiFolder, FiLayout, FiUsers } from 'react-icons/fi';

const SectorList = ({ sectors, loading, onEdit, onDelete, onView }) => {
    const getSectorTypeLabel = (type) => {
        switch (type) {
            case 'COMMERCIAL': return 'Commercial / Corporate';
            case 'NGO': return 'NGO / Non-Profit';
            case 'PUBLIC': return 'Public Sector / Government';
            case 'CONSULTING': return 'Consulting / Professional Services';
            default: return type;
        }
    };

    const getSectorTypeColor = (type) => {
        switch (type) {
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
                <p>Try adjusting your filters or create a new sector.</p>
            </div>
        );
    }

    return (
        <div className="sector-list-view">
            <table className="sector-table">
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Frameworks</th>
                        <th>Templates</th>
                        <th>Users</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sectors.map(sector => (
                        <tr key={sector.id} onClick={() => onView(sector)} className="clickable-row">
                            <td>
                                <div className="sector-name-cell">
                                    <div
                                        className="sector-color-dot"
                                        style={{ backgroundColor: getSectorTypeColor(sector.sector_type) }}
                                    />
                                    <span>{sector.name}</span>
                                </div>
                            </td>
                            <td><code>{sector.code}</code></td>
                            <td>
                                <span className="type-badge" style={{
                                    backgroundColor: getSectorTypeColor(sector.sector_type) + '20',
                                    color: getSectorTypeColor(sector.sector_type)
                                }}>
                                    {getSectorTypeLabel(sector.sector_type)}
                                </span>
                            </td>
                            <td>
                                <div className="stat-cell">
                                    <FiFolder size={12} />
                                    <span>{sector.framework_count || 0}</span>
                                </div>
                            </td>
                            <td>
                                <div className="stat-cell">
                                    <FiLayout size={12} />
                                    <span>{sector.template_count || 0}</span>
                                </div>
                            </td>
                            <td>
                                <div className="stat-cell">
                                    <FiUsers size={12} />
                                    <span>{sector.user_count || 0}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${sector.is_active ? 'active' : 'inactive'}`}>
                                    {sector.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="actions-cell">
                                <button
                                    className="action-btn view"
                                    onClick={(e) => { e.stopPropagation(); onView(sector); }}
                                    title="View"
                                >
                                    <FiEye size={14} />
                                </button>
                                <button
                                    className="action-btn edit"
                                    onClick={(e) => { e.stopPropagation(); onEdit(sector); }}
                                    title="Edit"
                                >
                                    <FiEdit2 size={14} />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={(e) => { e.stopPropagation(); onDelete(sector.id); }}
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

export default SectorList;