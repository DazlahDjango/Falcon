// src/pages/reviews/self-assessments/SelfAssessmentListPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, List, Users } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SelfAssessmentList } from '../../../components/reviews/self-assessments';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SelfAssessmentListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewSelfAssessment, isAdmin } = useReviewsPermissions();

  const isTeamView = location.pathname.includes('team');

  if (!canViewSelfAssessment && !isAdmin) {
    return (
      <div className="self-assessment-list-page">
        <div className="self-assessment-list-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view self assessments.</p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (isTeamView) return 'Team Self-Assessments';
    if (isAdmin) return 'Self-Assessment Records';
    return 'My Self-Assessment History';
  };

  const getPageDescription = () => {
    if (isTeamView) return 'Review self-assessment submissions, draft progress, and reflections for your team.';
    if (isAdmin) return 'Company-wide master archive and searchable records of all employee self-evaluations.';
    return 'View and manage all your past and current self-evaluations and performance submissions.';
  };

  return (
    <div className="self-assessment-list-page">
      <div className="self-assessment-list-page-header">
        <button className="self-assessment-list-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <ReviewBreadcrumbs
          items={[
            {
              label: getPageTitle(),
              path: isTeamView ? '/reviews/self-assessment/team' : '/reviews/self-assessment',
              isActive: true,
            },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <h1 className="self-assessment-list-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            {isTeamView ? <Users size={24} style={{ color: '#2563eb' }} /> : <List size={24} style={{ color: '#2563eb' }} />}
            {getPageTitle()}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {getPageDescription()}
          </p>
        </div>

        {/* Manager/Supervisor View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/reviews/self-assessment/team')}
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
              background: isTeamView ? '#eff6ff' : 'transparent',
              color: isTeamView ? '#2563eb' : '#64748b',
              borderBottom: isTeamView ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={16} />
            Team Assessments
          </button>
          <button
            type="button"
            onClick={() => navigate('/reviews/self-assessment')}
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
              background: !isTeamView ? '#eff6ff' : 'transparent',
              color: !isTeamView ? '#2563eb' : '#64748b',
              borderBottom: !isTeamView ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <List size={16} />
            My Assessment
          </button>
        </div>
      </div>

      <SelfAssessmentList isTeamView={isTeamView} />
    </div>
  );
};

export default SelfAssessmentListPage;