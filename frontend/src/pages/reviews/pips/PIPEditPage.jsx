// src/pages/reviews/pips/PIPEditPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPEdit } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPEditPage = () => {
  const navigate = useNavigate();
  const { canManagePIPs, isAdmin } = useReviewsPermissions();

  if (!canManagePIPs && !isAdmin) {
    return (
      <div className="pip-edit-page">
        <div className="pip-edit-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to edit PIPs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-edit-page">
      <div className="pip-edit-page-header">
        <button className="pip-edit-page-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIPs', path: '/reviews/pips' },
            { label: 'Edit', path: '/reviews/pips/:id/edit', isActive: true },
          ]}
        />
        <h1 className="pip-edit-page-title">
          <Edit size={24} />
          Edit PIP
        </h1>
      </div>

      <PIPEdit />
    </div>
  );
};

export default PIPEditPage;