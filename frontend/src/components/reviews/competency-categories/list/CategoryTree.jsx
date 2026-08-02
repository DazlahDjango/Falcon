// src/components/reviews/competency-categories/list/CategoryTree.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, FolderOpen, Folder, Edit, Trash2 } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencyCategories } from '../../../../hooks/reviews';

const CategoryTree = ({ categories = [] }) => {
  const navigate = useNavigate();
  const { deleteCategory, canManage } = useCompetencyCategories();
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id, name, competencyCount) => {
    if (competencyCount > 0) {
      alert('Cannot delete a category that contains competencies.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCategory(id);
    }
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children?.length > 0;
    const isExpanded = expanded[category.id];
    const competencyCount = category.competency_count || category.competencies?.length || 0;

    return (
      <div key={category.id} className="category-tree-item" style={{ paddingLeft: level * 24 }}>
        <div className="category-tree-node">
          <div className="category-tree-node-left">
            {hasChildren && (
              <button
                className="category-tree-toggle"
                onClick={() => toggleExpand(category.id)}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            <span className="category-tree-icon">
              {hasChildren ? <Folder size={18} /> : <FolderOpen size={18} />}
            </span>
            <span className="category-tree-name">{category.name}</span>
            <span className="category-tree-count">({competencyCount} competencies)</span>
            <ReviewStatusBadge status={category.is_active ? 'active' : 'inactive'} size="sm" />
          </div>
          <div className="category-tree-node-right">
            {canManage && (
              <>
                <button
                  className="category-tree-action-btn"
                  onClick={() => navigate(`/reviews/competency-categories/${category.id}/edit`)}
                  aria-label="Edit"
                  title="Edit Category"
                >
                  <Edit size={14} />
                </button>
                <button
                  className="category-tree-action-btn danger"
                  onClick={() => handleDelete(category.id, category.name, competencyCount)}
                  aria-label="Delete"
                  disabled={competencyCount > 0}
                  title={competencyCount > 0 ? 'Category contains competencies and cannot be deleted' : 'Delete Category'}
                  style={{
                    opacity: competencyCount > 0 ? 0.4 : 1,
                    cursor: competencyCount > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="category-tree-children">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Build tree structure
  const buildTree = (items) => {
    const map = {};
    const roots = [];

    items.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const tree = buildTree(categories);

  return (
    <div className="category-tree">
      <div className="category-tree-header">
        <span className="category-tree-header-label">Category Hierarchy</span>
        <span className="category-tree-header-count">{categories.length} categories</span>
      </div>
      <div className="category-tree-body">
        {tree.length === 0 ? (
          <div className="category-tree-empty">No categories to display</div>
        ) : (
          tree.map(category => renderCategory(category, 0))
        )}
      </div>
    </div>
  );
};

export default CategoryTree;