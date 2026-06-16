// src/pages/reviews/competency-categories/CategoriesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderTree } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CategoryList } from '../../../components/reviews/competency-categories';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { canViewCompetencies } = useReviewsPermissions();

  if (!canViewCompetencies) {
    return (
      <div className="categories-page">
        <div className="categories-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view competency categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-page-header">
        <button className="categories-page-back" onClick={() => navigate('/reviews/competencies')}>
          <ArrowLeft size={20} />
          Back to Competencies
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Competency Categories', path: '/reviews/competency-categories', isActive: true },
          ]}
        />
        <h1 className="categories-page-title">
          <FolderTree size={24} />
          Competency Categories
        </h1>
      </div>

      <CategoryList />
    </div>
  );
};

export default CategoriesPage;