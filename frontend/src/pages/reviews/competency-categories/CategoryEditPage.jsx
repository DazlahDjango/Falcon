// src/pages/reviews/competency-categories/CategoryEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CategoryEdit } from '../../../components/reviews/competency-categories';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CategoryEditPage = () => {
  const navigate = useNavigate();
  const { canManageCompetencies, isAdmin } = useReviewsPermissions();

  if (!canManageCompetencies && !isAdmin) {
    return (
      <div className="category-edit-page">
        <div className="category-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit competency categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-edit-page">
      <div className="category-edit-page-header">
        <button className="category-edit-page-back" onClick={() => navigate('/reviews/competency-categories')}>
          <ArrowLeft size={20} />
          Back to Categories
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competency Categories', path: '/reviews/competency-categories' },
            { label: 'Edit', path: '/reviews/competency-categories/:id/edit', isActive: true },
          ]}
        />
        <h1 className="category-edit-page-title">
          <Edit size={24} />
          Edit Category
        </h1>
      </div>

      <CategoryEdit />
    </div>
  );
};

export default CategoryEditPage;