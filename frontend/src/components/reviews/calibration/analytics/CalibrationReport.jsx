// src/components/reviews/calibration/analytics/CalibrationReport.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCalibration } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import CalibrationSummary from './CalibrationSummary';
import CalibrationOutliers from './CalibrationOutliers';
import CalibrationRecommendations from './CalibrationRecommendations';
import { FileText, AlertTriangle, TrendingUp } from 'lucide-react';

const CalibrationReport = () => {
  const { id } = useParams();
  const { report, reportLoading, reportError, getReport, canManage } = useCalibration();

  useEffect(() => {
    if (id) {
      getReport(id);
    }
  }, [id, getReport]);

  if (reportLoading) return <ReviewLoading size="lg" text="Loading calibration report..." />;
  if (reportError) return <ReviewError error={reportError} onRetry={() => getReport(id)} />;
  if (!report) return null;

  return (
    <div className="calibration-report">
      <div className="calibration-report-header">
        <h1 className="calibration-report-title">Calibration Report</h1>
        <div className="calibration-report-meta">
          <span className="calibration-report-session">{report.session?.name}</span>
          <span className="calibration-report-date">
            {new Date(report.session?.scheduled_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="calibration-report-content">
        <div className="calibration-report-grid">
          <div className="calibration-report-main">
            <CalibrationSummary summary={report} />
            <CalibrationOutliers outliers={report.outliers} />
          </div>
          <div className="calibration-report-sidebar">
            <CalibrationRecommendations recommendations={report.recommendations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationReport;