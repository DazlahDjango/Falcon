// src/pages/reviews/cycles/CycleCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CycleCreate } from '../../../components/reviews/cycles';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CycleCreatePage = () => {
  const navigate = useNavigate();
  const { canManageCycles, isAdmin } = useReviewsPermissions();

  if (!canManageCycles && !isAdmin) {
    return (
      <div className="cycle-create-page">
        <div className="cycle-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create review cycles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-create-page">
      <div className="cycle-create-page-header">
        <button className="cycle-create-page-back" onClick={() => navigate('/reviews/cycles')}>
          <ArrowLeft size={20} />
          Back to Cycles
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Review Cycles', path: '/reviews/cycles' },
            { label: 'Create', path: '/reviews/cycles/create', isActive: true },
          ]}
        />
        <h1 className="cycle-create-page-title">
          <Plus size={24} />
          Create Review Cycle
        </h1>
      </div>

      <CycleCreate />
    </div>
  );
};

export default CycleCreatePage;