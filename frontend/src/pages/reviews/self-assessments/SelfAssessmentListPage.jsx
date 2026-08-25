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
              label: isTeamView ? 'Team Self-Assessments' : 'Self-Assessment Records',
              path: isTeamView ? '/reviews/self-assessment/team' : '/reviews/self-assessments',
              isActive: true,
            },
          ]}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <h1 className="self-assessment-list-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            {isTeamView ? <Users size={24} style={{ color: '#2563eb' }} /> : <List size={24} style={{ color: '#2563eb' }} />}
            {isTeamView ? 'Team Self-Assessments' : 'Self-Assessment Records'}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {isTeamView
              ? 'Review self-assessment submissions, draft progress, and reflections for your team.'
              : 'Company-wide master archive and searchable records of all employee self-evaluations.'}
          </p>
        </div>
      </div>

      <SelfAssessmentList isTeamView={isTeamView} />
    </div>
  );
};

export default SelfAssessmentListPage;