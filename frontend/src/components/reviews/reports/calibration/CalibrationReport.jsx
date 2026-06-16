// src/components/reviews/reports/calibration/CalibrationReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reports';
import { ReviewLoading, ReviewError } from '../../common';
import CalibrationSummary from './CalibrationSummary';

const CalibrationReport = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { calibrationSummary, loading, error, getCalibrationSummary, exportReport, canView } = useReviewsReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (cycleId) {
      getCalibrationSummary(cycleId);
    }
  }, [cycleId, getCalibrationSummary]);

  const handleRefresh = () => {
    if (cycleId) {
      getCalibrationSummary(cycleId);
    }
  };

  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      await exportReport('calibration', cycleId, format);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading calibration report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!calibrationSummary) return null;

  return (
    <div className="calibration-report">
      <div className="calibration-report-header">
        <button className="calibration-report-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <div className="calibration-report-actions">
          <button className="calibration-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="calibration-report-content">
        <div className="calibration-report-header-section">
          <h1 className="calibration-report-title">Calibration Report</h1>
          <div className="calibration-report-meta">
            <span className="calibration-report-cycle">
              {calibrationSummary.review_cycle?.name || 'All Cycles'}
            </span>
          </div>
        </div>

        <CalibrationSummary summary={calibrationSummary} />
      </div>
    </div>
  );
};

export default CalibrationReport;