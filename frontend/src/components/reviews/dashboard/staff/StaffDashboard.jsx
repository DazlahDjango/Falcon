// src/components/reviews/dashboard/staff/StaffDashboard.jsx
import React, { useEffect } from 'react';
import { useReviewsDashboard } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import StaffOverview from './StaffOverview';
import StaffDeadlines from './StaffDeadlines';
import StaffPIPStatus from './StaffPIPStatus';
import StaffFeedbackSummary from './StaffFeedbackSummary';
import { useReviewsPermissions } from '../../../../hooks/reviews';

const StaffDashboard = () => {
  const { staff, loading, error, getStaffDashboard, canViewStaff } = useReviewsDashboard();
  const permissions = useReviewsPermissions();

  useEffect(() => {
    if (canViewStaff) {
      getStaffDashboard();
    }
  }, [canViewStaff, getStaffDashboard]);

  if (!canViewStaff) {
    return (
      <div className="dashboard staff-dashboard">
        <div className="staff-dashboard-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the staff dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) return <ReviewLoading size="lg" text="Loading dashboard..." />;
  if (error) return <ReviewError error={error} onRetry={getStaffDashboard} />;
  if (!staff) {
    return (
      <div className="dashboard staff-dashboard">
        <div className="dashboard-empty">
          <h2>Staff dashboard data unavailable</h2>
          <p>We could not load your dashboard data right now.</p>
          <button className="btn btn-outline" onClick={getStaffDashboard}>
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard staff-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Dashboard</h1>
        <span className="dashboard-subtitle">Welcome back, {staff.employee?.name || 'Employee'}!</span>
      </div>

      <div className="dashboard-grid">
        <div className="staff-dashboard-main">
          <StaffOverview employee={staff.employee} />
          <StaffDeadlines deadlines={staff.upcoming_deadlines} />
          <StaffFeedbackSummary summary={staff.pending_feedback_requests} />
        </div>
        <div className="staff-dashboard-sidebar">
          <StaffPIPStatus pip={staff.active_pip} />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;