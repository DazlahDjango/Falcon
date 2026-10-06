// src/pages/reviews/final-ratings/FinalRatingsPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Users, User } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { FinalRatingList } from '../../../components/reviews/final-ratings';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const FinalRatingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewFinalRating, isSupervisor, isAdmin, isHrAdmin, isExecutive } = useReviewsPermissions();

  const isMyView = location.pathname.includes('/my');
  const isTeamView = location.pathname.includes('/team') || (!isMyView && (isSupervisor || isExecutive) && !location.pathname.endsWith('/final-ratings'));

  if (!canViewFinalRating) {
    return (
      <div className="final-ratings-page">
        <div className="final-ratings-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view final ratings.</p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (isMyView) return 'My Final Rating';
    if (isTeamView) return 'Team Final Ratings';
    return 'Final Ratings';
  };

  const hasManagerRole = isSupervisor || isAdmin || isHrAdmin || isExecutive;

  return (
    <div className="final-ratings-page">
      <div className="final-ratings-page-header">
        <button className="final-ratings-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            {
              label: getPageTitle(),
              path: isMyView ? '/reviews/final-ratings/my' : isTeamView ? '/reviews/final-ratings/team' : '/reviews/final-ratings',
              isActive: true,
            },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <h1 className="final-ratings-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Star size={24} style={{ color: '#f59e0b' }} />
            {getPageTitle()}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {isMyView
              ? 'View your approved final performance score, rubric breakdown, and calibration outcomes.'
              : 'View and manage final performance ratings, calculated scores, and calibration outcomes for your team.'}
          </p>
        </div>

        {/* Manager/Supervisor View Switcher Tabs */}
        {hasManagerRole && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => navigate('/reviews/final-ratings/team')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: !isMyView ? '#eff6ff' : 'transparent',
                color: !isMyView ? '#2563eb' : '#64748b',
                borderBottom: !isMyView ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Users size={16} />
              Team Final Ratings
            </button>
            <button
              type="button"
              onClick={() => navigate('/reviews/final-ratings/my')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: isMyView ? '#eff6ff' : 'transparent',
                color: isMyView ? '#2563eb' : '#64748b',
                borderBottom: isMyView ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <User size={16} />
              My Final Rating
            </button>
          </div>
        )}
      </div>

      <FinalRatingList isMyView={isMyView} isTeamView={!isMyView && isTeamView} />
    </div>
  );
};

export default FinalRatingsPage;