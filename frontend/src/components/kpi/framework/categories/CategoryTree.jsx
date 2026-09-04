import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiChevronDown, FiFolder, FiEdit, FiTrash2, FiPlus, FiMove, FiTarget, FiEye } from 'react-icons/fi';
import CategoryMove from './CategoryMove';
import CategoryDetailModal from './CategoryDetailModal';

const CategoryTree = ({ categories, onEdit, onDelete, onMove, onAddSubcategory, onAddKpi, canManage }) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState({});
    const [viewingCategory, setViewingCategory] = useState(null);
    const [movingCategory, setMovingCategory] = useState(null);

    const toggleExpand = (id, e) => {
        if (e) e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCategoryClick = (category) => {
        setViewingCategory(category);
    };

    const handleKpiClick = (kpiId) => {
        navigate(`/kpi/kpis/${kpiId}`);
    };

    const handleAddKpiClick = (category, e) => {
        if (e) e.stopPropagation();
        if (onAddKpi) {
            onAddKpi(category);
        } else {
            navigate('/kpi/kpis/create', { state: { categoryId: category.id, categoryName: category.name } });
        }
    };

    const renderTreeNode = (category, level = 0) => {
        const isExpanded = expanded[category.id];
        const isViewing = viewingCategory?.id === category.id;
        const hasChildren = category.children && category.children.length > 0;
        const kpiList = category.kpis || [];
        const kpisCount = category.kpis_count ?? kpiList.length;

        return (
            <div key={category.id} className={`kpi-category-tree-node ${isViewing ? 'selected' : ''}`} style={{ marginLeft: level * 24 }}>
                <div className="kpi-category-tree-node-content">
                    <div className="kpi-category-tree-node-icon" onClick={(e) => toggleExpand(category.id, e)}>
                        {(hasChildren || kpisCount > 0) && (isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
                        <FiFolder size={16} />
                    </div>
                    <div className="kpi-category-tree-node-info" onClick={() => handleCategoryClick(category)} style={{ cursor: 'pointer' }}>
                        <div className="kpi-category-tree-node-name">
                            {category.name}
                            <span className="kpi-category-badge" style={{ marginLeft: 8, fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, background: '#e2e8f0', color: '#475569' }}>
                                {kpisCount} {kpisCount === 1 ? 'Performance Indicator' : 'Performance Indicators'}
                            </span>
                        </div>
                        <div className="kpi-category-tree-node-type">{category.category_type_display}</div>
                        {category.description && (
                            <div className="kpi-category-tree-node-description">{category.description}</div>
                        )}
                    </div>
                    <div className="kpi-category-tree-node-actions">
                        <button onClick={() => setViewingCategory(category)} title="View Key Result Area Detail & Performance Indicators" style={{ color: '#0284c7' }}>
                            <FiEye size={14} />
                        </button>
                        {canManage && (
                            <>
                                <button onClick={(e) => handleAddKpiClick(category, e)} title="Add Performance Indicator to this Key Result Area" style={{ color: '#2563eb' }}>
                                    <FiTarget size={14} />
                                </button>
                                <button onClick={() => onAddSubcategory(category)} title="Add Sub-Key Result Area">
                                    <FiPlus size={14} />
                                </button>
                                <button onClick={() => setMovingCategory(category)} title="Move">
                                    <FiMove size={14} />
                                </button>
                                <button onClick={() => onEdit(category)} title="Edit">
                                    <FiEdit size={14} />
                                </button>
                                <button onClick={() => onDelete(category.id)} title="Delete">
                                    <FiTrash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {isExpanded && (
                    <div className="kpi-category-tree-node-children">
                        {/* Render child categories */}
                        {hasChildren && category.children.map(child => renderTreeNode(child, level + 1))}

                        {/* Render KPIs belonging to this category */}
                        {kpiList.length > 0 && (
                            <div className="kpi-category-kpi-list" style={{ marginLeft: (level + 1) * 24 + 16, marginTop: 6, marginBottom: 8, borderLeft: '2px solid #cbd5e1', paddingLeft: 12 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                                    Performance Indicators in {category.name}:
                                </div>
                                {kpiList.map(kpi => (
                                    <div 
                                        key={kpi.id} 
                                        className="kpi-category-kpi-item" 
                                        onClick={() => handleKpiClick(kpi.id)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            padding: '6px 10px', 
                                            margin: '3px 0', 
                                            background: '#f8fafc', 
                                            borderRadius: 4, 
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiTarget size={13} color="#3b82f6" />
                                            <span style={{ fontWeight: 500, color: '#0f172a' }}>{kpi.name}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {kpi.kpi_type_display || kpi.kpi_type} • {kpi.unit || 'Score'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {kpiList.length === 0 && !hasChildren && (
                            <div style={{ marginLeft: (level + 1) * 24 + 16, fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                                No Performance Indicators assigned to this Key Result Area
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="kpi-category-tree">
            {categories.map(category => renderTreeNode(category))}
            
            {viewingCategory && (
                <CategoryDetailModal 
                    category={viewingCategory}
                    onClose={() => setViewingCategory(null)}
                    onAddKpi={onAddKpi}
                />
            )}

            {movingCategory && (
                <CategoryMove 
                    category={movingCategory}
                    categories={categories}
                    onMove={async (newParentId) => {
                        await onMove(movingCategory.id, newParentId);
                        setMovingCategory(null);
                    }}
                    onCancel={() => setMovingCategory(null)}
                />
            )}
        </div>
    );
};

export default CategoryTree;