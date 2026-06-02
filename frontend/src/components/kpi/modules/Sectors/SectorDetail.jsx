import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiFolder, FiLayout, FiUsers, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { useFrameworks, useTemplates } from '../../../../hooks/kpi';

const SectorDetail = ({ sector, onEdit, onDelete, onBack }) => {
    const [activeTab, setActiveTab] = useState('frameworks');
    const { frameworks, fetchBySector, loading: frameworksLoading } = useFrameworks(false);
    const { templates, fetchBySector: fetchTemplatesBySector, loading: templatesLoading } = useTemplates(false);

    useEffect(() => {
        if (sector?.id) {
            fetchBySector(sector.id);
            fetchTemplatesBySector(sector.id);
        }
    }, [sector?.id]);

    const getSectorTypeInfo = () => {
        const types = {
            COMMERCIAL: { label: 'Commercial / Corporate', icon: '🏢', color: '#667eea' },
            NGO: { label: 'NGO / Non-Profit', icon: '🤝', color: '#10b981' },
            PUBLIC: { label: 'Public Sector / Government', icon: '🏛️', color: '#3b82f6' },
            CONSULTING: { label: 'Consulting / Professional Services', icon: '💼', color: '#8b5cf6' },
        };
        return types[sector.sector_type] || { label: sector.sector_type, icon: '🏭', color: '#6c757d' };
    };

    const typeInfo = getSectorTypeInfo();

    return (
        <div className="sector-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Sectors
                </button>
                <div className="detail-actions">
                    <button className="btn-secondary" onClick={() => onEdit(sector)}>
                        <FiEdit2 size={14} />
                        Edit
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(sector.id)}>
                        <FiTrash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <div className="detail-icon" style={{ backgroundColor: typeInfo.color }}>
                        <span className="sector-icon-large">{typeInfo.icon}</span>
                    </div>
                    <div className="detail-info">
                        <h1 className="detail-title">{sector.name}</h1>
                        <div className="detail-meta">
                            <span className="detail-code">{sector.code}</span>
                            <span className="detail-badge" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                                {typeInfo.label}
                            </span>
                            {!sector.is_active && <span className="detail-badge inactive">Inactive</span>}
                        </div>
                    </div>
                </div>

                <div className="detail-stats">
                    <div className="stat-card">
                        <div className="stat-value">{frameworks.length}</div>
                        <div className="stat-label">Frameworks</div>
                        <FiFolder size={16} className="stat-icon" />
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{templates.length}</div>
                        <div className="stat-label">Templates</div>
                        <FiLayout size={16} className="stat-icon" />
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{sector.user_count || 0}</div>
                        <div className="stat-label">Users</div>
                        <FiUsers size={16} className="stat-icon" />
                    </div>
                </div>

                {sector.description && (
                    <div className="detail-section">
                        <h3 className="section-title">Description</h3>
                        <p className="section-content">{sector.description}</p>
                    </div>
                )}

                <div className="detail-section">
                    <div className="section-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'frameworks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('frameworks')}
                        >
                            <FiFolder size={14} />
                            Frameworks ({frameworks.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('templates')}
                        >
                            <FiLayout size={14} />
                            Templates ({templates.length})
                        </button>
                    </div>

                    <div className="section-content">
                        {activeTab === 'frameworks' && (
                            <div className="related-list">
                                {frameworksLoading ? (
                                    <div className="loading-small">Loading frameworks...</div>
                                ) : frameworks.length === 0 ? (
                                    <div className="empty-small">No frameworks created for this sector yet.</div>
                                ) : (
                                    frameworks.map(fw => (
                                        <div key={fw.id} className="related-item">
                                            <div className="related-item-info">
                                                <span className="related-item-icon">📊</span>
                                                <div>
                                                    <div className="related-item-title">{fw.name}</div>
                                                    <div className="related-item-meta">{fw.code} • v{fw.version}</div>
                                                </div>
                                            </div>
                                            <button className="related-item-link" onClick={() => { }}>
                                                View <FiChevronRight size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="related-list">
                                {templatesLoading ? (
                                    <div className="loading-small">Loading templates...</div>
                                ) : templates.length === 0 ? (
                                    <div className="empty-small">No templates available for this sector yet.</div>
                                ) : (
                                    templates.map(tpl => (
                                        <div key={tpl.id} className="related-item">
                                            <div className="related-item-info">
                                                <span className="related-item-icon">📝</span>
                                                <div>
                                                    <div className="related-item-title">{tpl.name}</div>
                                                    <div className="related-item-meta">{tpl.code} • Used {tpl.usage_count || 0} times</div>
                                                </div>
                                            </div>
                                            <button className="related-item-link" onClick={() => { }}>
                                                Use <FiExternalLink size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">KPI Default Settings</h3>
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="metadata-label">Default Calculation Logic:</span>
                            <span className="metadata-value">
                                {sector.metadata?.default_calculation_logic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better'}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Green Threshold:</span>
                            <span className="metadata-value">{sector.metadata?.recommended_thresholds?.green || 90}%</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Yellow Threshold:</span>
                            <span className="metadata-value">{sector.metadata?.recommended_thresholds?.yellow || 50}%</span>
                        </div>
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">Metadata</h3>
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="metadata-label">Created At:</span>
                            <span className="metadata-value">{new Date(sector.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Last Updated:</span>
                            <span className="metadata-value">{new Date(sector.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Typical KPI Types:</span>
                            <span className="metadata-value">{sector.metadata?.typical_kpi_types?.join(', ') || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectorDetail;