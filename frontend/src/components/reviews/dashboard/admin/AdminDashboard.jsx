// src/components/reviews/dashboard/admin/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useReviewsDashboard } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import SystemHealth from './SystemHealth';
import CycleManagement from './CycleManagement';
import CompletionAnalytics from './CompletionAnalytics';
import QualityMetrics from './QualityMetrics';
import PIPOverview from './PIPOverview';
import PromotionOverview from './PromotionOverview';
import CalibrationOverview from './CalibrationOverview';
import { useReviewsPermissions } from '../../../../hooks/reviews';

const AdminDashboard = () => {
  const { admin, loading, error, getAdminDashboard, canViewAdmin } = useReviewsDashboard();
  const permissions = useReviewsPermissions();

  useEffect(() => {
    if (canViewAdmin) {
      getAdminDashboard();
    }
  }, [canViewAdmin, getAdminDashboard]);

  if (!canViewAdmin) {
    return (
      <div className="dashboard admin-dashboard">
        <div className="admin-dashboard-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const hasAdminData = admin && Object.keys(admin).length > 0;

  if (loading) return <ReviewLoading size="lg" text="Loading admin dashboard..." />;
  if (error) return <ReviewError error={error} onRetry={getAdminDashboard} />;
  if (!hasAdminData) {
    return (
      <div className="dashboard admin-dashboard">
        <div className="dashboard-empty">
          <h2>Admin dashboard data unavailable</h2>
          <p>We could not load your admin dashboard right now.</p>
          <button className="btn btn-outline" onClick={getAdminDashboard}>
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <span className="dashboard-subtitle">System Overview & Management</span>
      </div>

      <div className="dashboard-grid">
        <div className="admin-dashboard-main">
          <SystemHealth health={admin.system_health} />
          <div className="admin-dashboard-cycles-queue">
            <CycleManagement cycles={admin.cycle_management} />
          </div>
          <div className="admin-dashboard-completion">
            <CompletionAnalytics analytics={admin.completion_analytics} />
          </div>
          <div className="admin-dashboard-quality">
            <QualityMetrics metrics={admin.quality_metrics} />
          </div>
        </div>
        <div className="admin-dashboard-sidebar">
          <PIPOverview overview={admin.pip_oversight} />
          <PromotionOverview overview={admin.promotion_oversight} />
          <CalibrationOverview overview={admin.calibration_oversight} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;