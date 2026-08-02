// src/components/reviews/reports/team/TeamReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import TeamSummary from './TeamSummary';
import TeamRatingsDistribution from './TeamRatingsDistribution';

const TeamReport = ({ managerId: propManagerId, cycleId: propCycleId }) => {
  const params = useParams();
  const managerId = propManagerId || params.managerId;
  const cycleId = propCycleId || params.cycleId;
  const navigate = useNavigate();
  const { teamSummary, loading, error, getTeamSummary, exportReport, canView } = useReviewsReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (managerId && cycleId) {
      getTeamSummary(managerId, cycleId);
    }
  }, [managerId, cycleId, getTeamSummary]);

  const handleRefresh = () => {
    if (managerId && cycleId) {
      getTeamSummary(managerId, cycleId);
    }
  };

  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      await exportReport('team', cycleId, format);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading team report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!teamSummary) return null;

  return (
    <div className="team-report">
      <div className="team-report-header">
        <button className="team-report-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <div className="team-report-actions">
          <button className="team-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="team-report-content">
        <div className="team-report-header-section">
          <h1 className="team-report-title">Team Performance Report</h1>
          <div className="team-report-meta">
            <span className="team-report-manager">
              Manager: {teamSummary.manager?.name}
            </span>
            <span className="team-report-cycle">
              Cycle: {teamSummary.review_cycle?.name}
            </span>
            <span className="team-report-count">
              {teamSummary.total_employees} employees
            </span>
          </div>
        </div>

        <div className="team-report-grid">
          <TeamSummary summary={teamSummary} />
          <TeamRatingsDistribution distribution={teamSummary.aggregate_stats?.ratings_distribution} />
        </div>
      </div>
    </div>
  );
};

export default TeamReport;