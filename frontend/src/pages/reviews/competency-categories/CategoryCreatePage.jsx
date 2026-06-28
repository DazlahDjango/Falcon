// src/pages/reviews/competency-categories/CategoryCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CategoryCreate } from '../../../components/reviews/competency-categories';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CategoryCreatePage = () => {
  const navigate = useNavigate();
  const { canManageCompetencies, isAdmin } = useReviewsPermissions();

  if (!canManageCompetencies && !isAdmin) {
    return (
      <div className="category-create-page">
        <div className="category-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create competency categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-create-page">
      <div className="category-create-page-header">
        <button className="category-create-page-back" onClick={() => navigate('/reviews/competency-categories')}>
          <ArrowLeft size={20} />
          Back to Categories
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competency Categories', path: '/reviews/competency-categories' },
            { label: 'Create', path: '/reviews/competency-categories/create', isActive: true },
          ]}
        />
        <h1 className="category-create-page-title">
          <Plus size={24} />
          Create Category
        </h1>
      </div>

      <CategoryCreate />
    </div>
  );
};

export default CategoryCreatePage;