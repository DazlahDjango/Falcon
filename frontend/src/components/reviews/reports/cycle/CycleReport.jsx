// src/components/reviews/reports/cycle/CycleReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CycleStats from './CycleStats';
import RatingDistributionReport from './RatingDistributionReport';

const CycleReport = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { cycleStats, ratingDistribution, loading, error, getCycleStats, getRatingDistribution, exportReport, canView } = useReviewsReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (cycleId) {
      getCycleStats(cycleId);
      getRatingDistribution(cycleId);
    }
  }, [cycleId, getCycleStats, getRatingDistribution]);

  const handleRefresh = () => {
    if (cycleId) {
      getCycleStats(cycleId);
      getRatingDistribution(cycleId);
    }
  };

  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      await exportReport('cycle', cycleId, format);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading cycle report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!cycleStats) return null;

  return (
    <div className="cycle-report">
      <div className="cycle-report-header">
        <button className="cycle-report-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <div className="cycle-report-actions">
          <button className="cycle-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="cycle-report-content">
        <div className="cycle-report-header-section">
          <h1 className="cycle-report-title">Cycle Performance Report</h1>
          <div className="cycle-report-meta">
            <span className="cycle-report-name">{cycleStats.cycle_name}</span>
            <span className="cycle-report-count">
              {cycleStats.total_employees} employees
            </span>
          </div>
        </div>

        <div className="cycle-report-grid">
          <CycleStats stats={cycleStats} />
          {ratingDistribution && (
            <RatingDistributionReport distribution={ratingDistribution} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CycleReport;