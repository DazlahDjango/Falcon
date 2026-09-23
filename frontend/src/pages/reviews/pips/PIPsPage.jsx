// src/pages/reviews/pips/PIPsPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPList } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewPIPs } = useReviewsPermissions();

  const isMyView = location.pathname.includes('/my');
  const isTeamView = location.pathname.includes('/team');

  const pageTitle = isMyView
    ? 'My Improvement Plan'
    : isTeamView
    ? 'Team Improvement Plans'
    : 'Performance Improvement Plans';

  if (!canViewPIPs) {
    return (
      <div className="pips-page">
        <div className="pips-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view PIPs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pips-page">
      <div className="pips-page-header">
        <button className="pips-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reviews', path: '/reviews' },
            { label: pageTitle, path: location.pathname, isActive: true },
          ]}
        />
        <h1 className="pips-page-title">
          <AlertTriangle size={24} />
          {pageTitle}
        </h1>
      </div>

      <PIPList isMyView={isMyView} isTeamView={isTeamView} />
    </div>
  );
};

export default PIPsPage;