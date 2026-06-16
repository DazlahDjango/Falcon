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
      <div className="staff-dashboard">
        <div className="staff-dashboard-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the staff dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) return <ReviewLoading size="lg" text="Loading dashboard..." />;
  if (error) return <ReviewError error={error} onRetry={getStaffDashboard} />;
  if (!staff) return null;

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-header">
        <h1 className="staff-dashboard-title">My Dashboard</h1>
        <span className="staff-dashboard-welcome">Welcome back, {staff.employee?.name || 'Employee'}!</span>
      </div>

      <div className="staff-dashboard-grid">
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