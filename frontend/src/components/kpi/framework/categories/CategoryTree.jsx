import React, { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiFolder, FiEdit, FiTrash2, FiPlus, FiMove } from 'react-icons/fi';
import CategoryMove from './CategoryMove';

const CategoryTree = ({ categories, onEdit, onDelete, onMove, onAddSubcategory, canManage }) => {
    const [expanded, setExpanded] = useState({});
    const [movingCategory, setMovingCategory] = useState(null);

    const toggleExpand = (id) => {
        setExpanded({ ...expanded, [id]: !expanded[id] });
    };

    const renderTreeNode = (category, level = 0) => {
        const isExpanded = expanded[category.id];
        const hasChildren = category.children && category.children.length > 0;

        return (
            <div key={category.id} className="kpi-category-tree-node" style={{ marginLeft: level * 24 }}>
                <div className="kpi-category-tree-node-content">
                    <div className="kpi-category-tree-node-icon" onClick={() => hasChildren && toggleExpand(category.id)}>
                        {hasChildren && (isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
                        <FiFolder size={16} />
                    </div>
                    <div className="kpi-category-tree-node-info">
                        <div className="kpi-category-tree-node-name">
                            {category.name}
                            <span className="kpi-category-tree-node-code">({category.code})</span>
                        </div>
                        <div className="kpi-category-tree-node-type">{category.category_type_display}</div>
                        {category.description && (
                            <div className="kpi-category-tree-node-description">{category.description}</div>
                        )}
                    </div>
                    {canManage && (
                        <div className="kpi-category-tree-node-actions">
                            <button onClick={() => onAddSubcategory(category)} title="Add Subcategory">
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
                        </div>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div className="kpi-category-tree-node-children">
                        {category.children.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="kpi-category-tree">
            {categories.map(category => renderTreeNode(category))}
            
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