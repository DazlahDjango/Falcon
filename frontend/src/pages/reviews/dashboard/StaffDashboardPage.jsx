// src/pages/reviews/dashboard/StaffDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { StaffDashboard, DashboardSwitcher } from '../../../components/reviews/dashboard';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const StaffDashboardPage = () => {
  const navigate = useNavigate();
  const { canViewStaffDashboard } = useReviewsPermissions();

  if (!canViewStaffDashboard) {
    return (
      <div className="staff-dashboard-page">
        <div className="staff-dashboard-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the staff dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-page">
      <div className="staff-dashboard-page-header">
        <button className="staff-dashboard-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Dashboard', path: '/reviews/dashboard/staff', isActive: true },
          ]}
        />
        <h1 className="staff-dashboard-page-title">
          <LayoutDashboard size={24} />
          My Dashboard
        </h1>
      </div>

      <DashboardSwitcher />
      <StaffDashboard />
    </div>
  );
};

export default StaffDashboardPage;