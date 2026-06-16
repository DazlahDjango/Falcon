// src/components/reviews/competency-categories/list/CategoryCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, FolderOpen, CheckCircle, XCircle } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';
import { useCompetencyCategories } from '../../../../hooks/reviews';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const { deleteCategory, canManage } = useCompetencyCategories();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      await deleteCategory(category.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/reviews/competency-categories/${category.id}/edit`);
  };

  const handleView = () => {
    navigate(`/reviews/competency-categories/${category.id}`);
  };

  const competencyCount = category.competencies?.length || 0;

  return (
    <div className="category-card" onClick={handleView}>
      <div className="category-card-header">
        <div className="category-card-icon">
          <FolderOpen size={24} />
        </div>
        <div className="category-card-title-section">
          <h3 className="category-card-title">{category.name}</h3>
          <div className="category-card-badges">
            <ReviewStatusBadge status={category.is_active ? 'active' : 'inactive'} />
          </div>
        </div>
        <div className="category-card-actions">
          {canManage && (
            <>
              <button
                className="category-card-action-btn"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                className="category-card-action-btn danger"
                onClick={handleDelete}
                aria-label="Delete"
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