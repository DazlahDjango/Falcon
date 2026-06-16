// src/pages/reviews/cycles/CycleEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { CycleEdit } from '../../../components/reviews/cycles';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const CycleEditPage = () => {
  const navigate = useNavigate();
  const { canManageCycles, isAdmin } = useReviewsPermissions();

  if (!canManageCycles && !isAdmin) {
    return (
      <div className="cycle-edit-page">
        <div className="cycle-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit review cycles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cycle-edit-page">
      <div className="cycle-edit-page-header">
        <button className="cycle-edit-page-back" onClick={() => navigate('/reviews/cycles')}>
          <ArrowLeft size={20} />
          Back to Cycles
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Review Cycles', path: '/reviews/cycles' },
            { label: 'Edit', path: '/reviews/cycles/:id/edit', isActive: true },
          ]}
        />
        <h1 className="cycle-edit-page-title">
          <Edit size={24} />
          Edit Review Cycle
        </h1>
      </div>

      <CycleEdit />
    </div>
  );
};

export default CycleEditPage;