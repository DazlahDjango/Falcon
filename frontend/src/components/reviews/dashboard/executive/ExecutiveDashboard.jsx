// src/components/reviews/dashboard/executive/ExecutiveDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useReviewsDashboard } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import TenantOverview from './TenantOverview';
import CyclePerformanceCard from './CyclePerformanceCard';
import DepartmentRankings from './DepartmentRankings';
import PromotionPipelineCard from './PromotionPipelineCard';
import PIPSummaryCard from './PIPSummaryCard';
import CalibrationNeedsCard from './CalibrationNeedsCard';
import TrendsCard from './TrendsCard';
import { useReviewsPermissions } from '../../../../hooks/reviews';

const ExecutiveDashboard = () => {
  const { executive, loading, error, getExecutiveDashboard, canViewExecutive } = useReviewsDashboard();
  const permissions = useReviewsPermissions();
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    if (canViewExecutive) {
      getExecutiveDashboard(selectedDepartment);
    }
  }, [canViewExecutive, selectedDepartment, getExecutiveDashboard]);

  if (!canViewExecutive) {
    return (
      <div className="dashboard executive-dashboard">
        <div className="executive-dashboard-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view the executive dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) return <ReviewLoading size="lg" text="Loading executive dashboard..." />;
  if (error) return <ReviewError error={error} onRetry={() => getExecutiveDashboard(selectedDepartment)} />;
  if (!executive) {
    return (
      <div className="dashboard executive-dashboard">
        <div className="dashboard-empty">
          <h2>Executive dashboard data unavailable</h2>
          <p>We could not load your executive dashboard right now.</p>
          <button className="btn btn-outline" onClick={() => getExecutiveDashboard(selectedDepartment)}>
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard executive-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Executive Dashboard</h1>
          <span className="dashboard-subtitle">Organization Performance Overview</span>
        </div>
        <div className="executive-dashboard-filters">
          <select
            className="executive-dashboard-filter"
            value={selectedDepartment || ''}
            onChange={(e) => setSelectedDepartment(e.target.value || null)}
          >
            <option value="">All Departments</option>
            {/* Department options would be populated from data */}
          </select>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="executive-dashboard-main">
          <div className="executive-dashboard-stats">
            <TenantOverview overview={executive.tenant_overview} />
          </div>
          <div className="executive-dashboard-cycles">
            <CyclePerformanceCard performance={executive.cycle_performance} />
          </div>
          <div className="executive-dashboard-trends">
            <TrendsCard trends={executive.trends} />
          </div>
          <div className="executive-dashboard-pip">
            <PIPSummaryCard summary={executive.pip_summary} />
          </div>
        </div>
        <div className="executive-dashboard-sidebar">
          <DepartmentRankings rankings={executive.department_rankings} />
          <PromotionPipelineCard pipeline={executive.promotion_pipeline} />
          <CalibrationNeedsCard needs={executive.calibration_needs} />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;