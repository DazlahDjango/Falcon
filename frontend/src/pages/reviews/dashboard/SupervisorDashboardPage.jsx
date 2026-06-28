// src/pages/reviews/dashboard/SupervisorDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { SupervisorDashboard } from '../../../components/reviews/dashboard';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const SupervisorDashboardPage = () => {
  const navigate = useNavigate();
  const { canViewSupervisorDashboard, isSupervisor, isAdmin } = useReviewsPermissions();

  if (!canViewSupervisorDashboard && !isSupervisor && !isAdmin) {
    return (
      <div className="supervisor-dashboard-page">
        <div className="supervisor-dashboard-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the supervisor dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-dashboard-page">
      <div className="supervisor-dashboard-page-header">
        <button className="supervisor-dashboard-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Dashboard', path: '/reviews/dashboard/supervisor', isActive: true },
          ]}
        />
        <h1 className="supervisor-dashboard-page-title">
          <Users size={24} />
          Team Dashboard
        </h1>
      </div>

      <SupervisorDashboard />
    </div>
  );
};

export default SupervisorDashboardPage;