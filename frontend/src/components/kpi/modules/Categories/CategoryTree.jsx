import React, { useState } from 'react';
import { FiFolder, FiFolderPlus, FiEdit2, FiTrash2, FiEye, FiMove, FiChevronRight, FiChevronDown } from 'react-icons/fi';

const CategoryTreeNode = ({ category, onEdit, onDelete, onView, onMove, level = 0, expanded, onToggle }) => {
    const [showMoveMenu, setShowMoveMenu] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    const getCategoryTypeColor = (type) => {
        switch (type) {
            case 'FINANCIAL': return '#10b981';
            case 'IMPACT': return '#8b5cf6';
            case 'OPERATIONAL': return '#3b82f6';
            case 'CUSTOMER': return '#f59e0b';
            case 'INTERNAL': return '#ef4444';
            case 'GROWTH': return '#06b6d4';
            case 'COMPLIANCE': return '#6b7280';
            default: return '#6c757d';
        }
    };

    return (
        <div className="category-tree-node" style={{ marginLeft: level * 24 }}>
            <div className="category-node-content">
                <div className="node-expand" onClick={() => onToggle(category.id)}>
                    {hasChildren && (expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />)}
                    {!hasChildren && <span className="node-placeholder" />}
                </div>
                <div
                    className="node-icon"
                    style={{ backgroundColor: getCategoryTypeColor(category.category_type) }}
                >
                    <FiFolder size={14} color="white" />
                </div>
                <div className="node-info" onClick={() => onView(category)}>
                    <span className="node-name">{category.name}</span>
                    <span className="node-code">{category.code}</span>
                    {!category.is_active && <span className="node-badge inactive">Inactive</span>}
                </div>
                <div className="node-actions">
                    <button
                        className="node-btn node-btn-view"
                        onClick={() => onView(category)}
                        title="View Details"
                    >
                        <FiEye size={14} />
                    </button>
                    <button
                        className="node-btn node-btn-edit"
                        onClick={() => onEdit(category)}
                        title="Edit"
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        className="node-btn node-btn-move"
                        onClick={() => setShowMoveMenu(!showMoveMenu)}
                        title="Move"
                    >
                        <FiMove size={14} />
                    </button>
                    <button
                        className="node-btn node-btn-delete"
                        onClick={() => onDelete(category.id)}
                        title="Delete"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>
            {showMoveMenu && (
                <MoveCategoryMenu
                    category={category}
                    onMove={(parentId) => {
                        onMove(category.id, parentId);
                        setShowMoveMenu(false);
                    }}
                    onClose={() => setShowMoveMenu(false)}
                />
            )}
            {expanded && hasChildren && (
                <div className="category-node-children">
                    {category.children.map(child => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            onMove={onMove}
                            level={level + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MoveCategoryMenu = ({ category, onMove, onClose }) => {
    // This would fetch available parent categories
    return (
        <div className="move-menu">
            <div className="move-menu-header">
                <span>Move "{category.name}" to...</span>
                <button onClick={onClose}>×</button>
            </div>
            <div className="move-menu-options">
                <button onClick={() => onMove(null)} className="move-option">
                    <FiFolder size={14} />
                    Root Level (No Parent)
                </button>
                {/* Dynamic parent options would go here */}
            </div>
        </div>
    );
};

const CategoryTree = ({ categories, categoryTree, loading, onEdit, onDelete, onView, onMove, onReorder, selectedFramework }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleNode = (categoryId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedNodes(newExpanded);
    };

    const expandAll = () => {
        const allIds = new Set();
        const collectIds = (nodes) => {
            nodes.forEach(node => {
                allIds.add(node.id);
                if (node.children) collectIds(node.children);
            });
        };
        collectIds(categoryTree);
        setExpandedNodes(allIds);
    };

    const collapseAll = () => {
        setExpandedNodes(new Set());
    };

    if (loading) {
        return (
            <div className="category-loading">
                <div className="spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    if (!selectedFramework) {
        return (
            <div className="category-empty">
                <div className="empty-icon">📂</div>
                <h3>Select a Framework</h3>
                <p>Please select a framework from the filters above to view its categories.</p>
            </div>
        );
    }

    if (categoryTree.length === 0) {
        return (
            <div className="category-empty">
                <div className="empty-icon">🔍</div>
                <h3>No Categories Found</h3>
                <p>Create your first category to organize KPIs within this framework.</p>
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-create-category'))}>
                    <FiFolderPlus size={16} />
                    Create Category
                </button>
            </div>
        );
    }

    return (
        <div className="category-tree-container">
            <div className="tree-toolbar">
                <span className="tree-count">{categories.length} categories</span>
                <div className="tree-actions">
                    <button onClick={expandAll} className="tree-action-btn">Expand All</button>
                    <button onClick={collapseAll} className="tree-action-btn">Collapse All</button>
                </div>
            </div>
            <div className="category-tree">
                {categoryTree.map(category => (
                    <CategoryTreeNode
                        key={category.id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                        onMove={onMove}
                        expanded={expandedNodes.has(category.id)}
                        onToggle={toggleNode}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryTree;