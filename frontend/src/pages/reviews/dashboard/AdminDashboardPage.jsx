// src/pages/reviews/dashboard/AdminDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { AdminDashboard, DashboardSwitcher } from '../../../components/reviews/dashboard';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { canViewAdminDashboard, isAdmin } = useReviewsPermissions();

  if (!canViewAdminDashboard && !isAdmin) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-page-header">
        <button className="admin-dashboard-page-back" onClick={() => navigate('/reviews')}>
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Dashboard', path: '/reviews/dashboard/admin', isActive: true },
          ]}
        />
        <h1 className="admin-dashboard-page-title">
          <Settings size={24} />
          Admin Dashboard
        </h1>
      </div>

      <DashboardSwitcher />
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;