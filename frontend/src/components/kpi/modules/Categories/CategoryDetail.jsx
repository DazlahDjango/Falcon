import React from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiFolder, FiBarChart2 } from 'react-icons/fi';

const CategoryDetail = ({ category, onEdit, onDelete, onBack }) => {
    const getCategoryTypeInfo = (type) => {
        const types = {
            FINANCIAL: { label: 'Financial', color: '#10b981', icon: '💰' },
            IMPACT: { label: 'Impact / Outcomes', color: '#8b5cf6', icon: '🎯' },
            OPERATIONAL: { label: 'Operational', color: '#3b82f6', icon: '⚙️' },
            CUSTOMER: { label: 'Customer / Stakeholder', color: '#f59e0b', icon: '👥' },
            INTERNAL: { label: 'Internal Process', color: '#ef4444', icon: '🏢' },
            GROWTH: { label: 'Growth & Learning', color: '#06b6d4', icon: '📈' },
            COMPLIANCE: { label: 'Compliance & Risk', color: '#6b7280', icon: '📋' },
        };
        return types[type] || { label: type, color: '#6c757d', icon: '📁' };
    };

    const typeInfo = getCategoryTypeInfo(category.category_type);

    return (
        <div className="category-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FiArrowLeft size={16} />
                    Back to Categories
                </button>
                <div className="detail-actions">
                    <button className="btn-secondary" onClick={() => onEdit(category)}>
                        <FiEdit2 size={14} />
                        Edit
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(category.id)}>
                        <FiTrash2 size={14} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <div className="detail-icon" style={{ backgroundColor: category.color || typeInfo.color }}>
                        <span className="category-icon-large">{category.icon || typeInfo.icon}</span>
                    </div>
                    <div className="detail-info">
                        <h1 className="detail-title">{category.name}</h1>
                        <div className="detail-meta">
                            <span className="detail-code">{category.code}</span>
                            <span className="detail-badge" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                                {typeInfo.label}
                            </span>
                            {!category.is_active && <span className="detail-badge inactive">Inactive</span>}
                        </div>
                    </div>
                </div>

                <div className="detail-stats">
                    <div className="stat-card">
                        <div className="stat-value">{category.children_count || 0}</div>
                        <div className="stat-label">Sub-categories</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{category.kpi_count || 0}</div>
                        <div className="stat-label">KPIs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{category.display_order || 0}</div>
                        <div className="stat-label">Display Order</div>
                    </div>
                </div>

                {category.description && (
                    <div className="detail-section">
                        <h3 className="section-title">Description</h3>
                        <p className="section-content">{category.description}</p>
                    </div>
                )}

                <div className="detail-section">
                    <h3 className="section-title">Parent Hierarchy</h3>
                    <div className="hierarchy-tree">
                        {category.parent_name ? (
                            <div className="hierarchy-item">
                                <FiFolder size={14} />
                                <span>{category.parent_name}</span>
                                <FiArrowLeft size={12} className="hierarchy-arrow" />
                                <strong>{category.name}</strong>
                            </div>
                        ) : (
                            <div className="hierarchy-item">
                                <FiFolder size={14} />
                                <strong>{category.name}</strong> (Root Level)
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-section">
                    <h3 className="section-title">Framework Information</h3>
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <span className="metadata-label">Framework:</span>
                            <span className="metadata-value">{category.framework_name}</span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Created At:</span>
                            <span className="metadata-value">
                                {new Date(category.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <span className="metadata-label">Last Updated:</span>
                            <span className="metadata-value">
                                {new Date(category.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {category.kpi_count > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">
                            <FiBarChart2 size={16} />
                            KPIs in this Category
                        </h3>
                        <button className="btn-link" onClick={() => { }}>
                            View all {category.kpi_count} KPIs →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryDetail;