// src/pages/reviews/pips/PIPCreatePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPCreate } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPCreatePage = () => {
  const navigate = useNavigate();
  const { canManagePIPs, isAdmin } = useReviewsPermissions();

  if (!canManagePIPs && !isAdmin) {
    return (
      <div className="pip-create-page">
        <div className="pip-create-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to create PIPs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pip-create-page">
      <div className="pip-create-page-header">
        <button className="pip-create-page-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'PIPs', path: '/reviews/pips' },
            { label: 'Create', path: '/reviews/pips/create', isActive: true },
          ]}
        />
        <h1 className="pip-create-page-title">
          <Plus size={24} />
          Create PIP
        </h1>
      </div>

      <PIPCreate />
    </div>
  );
};

export default PIPCreatePage;