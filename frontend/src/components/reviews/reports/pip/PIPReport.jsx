// src/components/reviews/reports/pip/PIPReport.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import PIPSummary from './PIPSummary';
import PIPTrends from './PIPTrends';

const PIPReport = () => {
  const navigate = useNavigate();
  const { pipSummary, loading, error, getPIPSummary, exportReport, canView } = useReviewsReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getPIPSummary();
  }, [getPIPSummary]);

  const handleRefresh = () => {
    getPIPSummary();
  };

  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      await exportReport('pip', null, format);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading PIP report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!pipSummary) return null;

  return (
    <div className="pip-report">
      <div className="pip-report-header">
        <button className="pip-report-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <div className="pip-report-actions">
          <button className="pip-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="pip-report-content">
        <div className="pip-report-header-section">
          <h1 className="pip-report-title">PIP Performance Report</h1>
          <div className="pip-report-meta">
            <span className="pip-report-count">
              {pipSummary.total_pips || 0} total PIPs
            </span>
            <span className="pip-report-active">
              {pipSummary.active_pips || 0} active
            </span>
          </div>
        </div>

        <div className="pip-report-grid">
          <PIPSummary data={pipSummary} />
          <PIPTrends data={pipSummary.trends || []} />
        </div>
      </div>
    </div>
  );
};

export default PIPReport;