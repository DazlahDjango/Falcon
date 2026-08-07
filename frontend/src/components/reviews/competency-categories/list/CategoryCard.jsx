// src/components/reviews/competency-categories/list/CategoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencyCategories } from '../../../../hooks/reviews';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const { deleteCategory, activate, deactivate, canManage } = useCompetencyCategories();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (category.competency_count > 0) {
      alert('Cannot delete a category that contains competencies.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      await deleteCategory(category.id);
    }
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    try {
      if (category.is_active) {
        if (category.competency_count > 0) {
          alert('Cannot deactivate a category that contains active competencies.');
          return;
        }
        await deactivate(category.id);
      } else {
        await activate(category.id);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/competency-categories/${category.id}/edit`);
  };

  const competencyCount = category.competency_count || 0;

  return (
    <div className="category-card">
      <div className="category-card-header">
        <div className="category-card-icon">
          <FolderOpen size={24} />
        </div>
        <div className="category-card-title-section">
          <h3 className="category-card-title">{category.name}</h3>
          <div className="category-card-badges flex items-center gap-2">
            {canManage ? (
              <label className="flex items-center gap-1 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={category.is_active || false}
                  onChange={handleToggleActive}
                  className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                />
                <span className={`text-xs ${category.is_active ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            ) : (
              <ReviewStatusBadge status={category.is_active ? 'active' : 'inactive'} />
            )}
          </div>
        </div>
        <div className="category-card-actions">
          {canManage && (
            <>
              <button
                className="category-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
                title="Edit Category"
              >
                <Edit size={16} />
              </button>
              <button
                className="category-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
                disabled={category.competency_count > 0}
                title={category.competency_count > 0 ? 'Category contains competencies and cannot be deleted' : 'Delete Category'}
                style={{
                  opacity: category.competency_count > 0 ? 0.4 : 1,
                  cursor: category.competency_count > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {category.description && (
        <p className="category-card-description">{category.description}</p>
      )}

      <div className="category-card-stats">
        <div className="category-card-stat">
          <span className="category-card-stat-label">Competencies</span>
          <span className="category-card-stat-value">{competencyCount}</span>
        </div>
        <div className="category-card-stat">
          <span className="category-card-stat-label">Order</span>
          <span className="category-card-stat-value">{category.order || 0}</span>
        </div>
      </div>

      <div className="category-card-footer">
        <span className="category-card-date">
          Updated {new Date(category.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;