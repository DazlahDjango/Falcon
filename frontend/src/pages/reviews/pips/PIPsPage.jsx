// src/pages/reviews/pips/PIPsPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Users, User, ShieldAlert } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { PIPList } from '../../../components/reviews/pips';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const PIPsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewPIPs, isSupervisor, isAdmin, isHrAdmin, isExecutive } = useReviewsPermissions();

  const isMyView = location.pathname.includes('/my');
  const isTeamView = location.pathname.includes('/team');

  const pageTitle = isMyView
    ? 'My Improvement Plan'
    : isTeamView
    ? 'Team Improvement Plans'
    : 'Performance Improvement Plans';

  const hasManagerRole = isSupervisor || isAdmin || isHrAdmin || isExecutive;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <h1 className="pips-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            {pageTitle}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {isMyView
              ? 'View your active performance improvement plan, target milestones, and review deadlines.'
              : 'Track, initiate, and manage structured Performance Improvement Plans (PIPs) across the organization.'}
          </p>
        </div>

        {/* Manager/Supervisor/HR View Switcher Tabs */}
        {hasManagerRole && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => navigate('/reviews/pips')}
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
              Organization & Team PIPs
            </button>
            <button
              type="button"
              onClick={() => navigate('/reviews/pips/my')}
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
              My Improvement Plan
            </button>
          </div>
        )}
      </div>

      <PIPList isMyView={isMyView} isTeamView={isTeamView} />
    </div>
  );
};

export default PIPsPage;