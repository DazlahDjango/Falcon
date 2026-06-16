// src/components/reviews/dashboard/supervisor/SupervisorDashboard.jsx
import React, { useEffect } from 'react';
import { useReviewsDashboard } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import TeamSummary from './TeamSummary';
import ReviewQueueCard from './ReviewQueueCard';
import SelfAssessmentProgressCard from './SelfAssessmentProgressCard';
import RatingsDistributionCard from './RatingsDistributionCard';
import SupervisorAlerts from './SupervisorAlerts';
import { useReviewsPermissions } from '../../../../hooks/reviews';

const SupervisorDashboard = () => {
  const { supervisor, loading, error, getSupervisorDashboard, canViewSupervisor } = useReviewsDashboard();
  const permissions = useReviewsPermissions();

  useEffect(() => {
    if (canViewSupervisor) {
      getSupervisorDashboard();
    }
  }, [canViewSupervisor, getSupervisorDashboard]);

  if (!canViewSupervisor) {
    return (
      <div className="supervisor-dashboard">
        <div className="supervisor-dashboard-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the supervisor dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) return <ReviewLoading size="lg" text="Loading supervisor dashboard..." />;
  if (error) return <ReviewError error={error} onRetry={getSupervisorDashboard} />;
  if (!supervisor) return null;

  return (
    <div className="supervisor-dashboard">
      <div className="supervisor-dashboard-header">
        <h1 className="supervisor-dashboard-title">Team Dashboard</h1>
        <span className="supervisor-dashboard-welcome">
          Welcome, {supervisor.supervisor?.name || 'Supervisor'}!
        </span>
      </div>

      <SupervisorAlerts alerts={supervisor.alerts} />

      <div className="supervisor-dashboard-grid">
        <div className="supervisor-dashboard-main">
          <TeamSummary summary={supervisor.team_summary} />
          <ReviewQueueCard reviews={supervisor.pending_reviews} />
          <SelfAssessmentProgressCard progress={supervisor.self_assessment_progress} />
        </div>
        <div className="supervisor-dashboard-sidebar">
          <RatingsDistributionCard distribution={supervisor.ratings_distribution} />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;