// src/components/reviews/reports/employee/EmployeeReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { useReviewsReports } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import EmployeeSummary from './EmployeeSummary';
import EmployeeReviewTimeline from './EmployeeReviewTimeline';
import EmployeeCompetencyComparison from './EmployeeCompetencyComparison';

const EmployeeReport = ({ employeeId: propEmployeeId, cycleId: propCycleId }) => {
  const params = useParams();
  const employeeId = propEmployeeId || params.employeeId;
  const cycleId = propCycleId || params.cycleId;
  const navigate = useNavigate();
  const { employeeSummary, loading, error, getEmployeeSummary, exportReport, canView } = useReviewsReports();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (employeeId && cycleId) {
      getEmployeeSummary(employeeId, cycleId);
    }
  }, [employeeId, cycleId, getEmployeeSummary]);

  const handleRefresh = () => {
    if (employeeId && cycleId) {
      getEmployeeSummary(employeeId, cycleId);
    }
  };

  const handleExport = async (format = 'pdf') => {
    setIsExporting(true);
    try {
      await exportReport('employee', cycleId, format);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <ReviewLoading size="lg" text="Loading employee report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;
  if (!employeeSummary) return null;

  return (
    <div className="employee-report">
      <div className="employee-report-header">
        <button className="employee-report-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <div className="employee-report-actions">
          <button className="employee-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} />
            Print
          </button>
          <button className="btn btn-primary" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="employee-report-content">
        <div className="employee-report-header-section">
          <h1 className="employee-report-title">Employee Performance Report</h1>
          <div className="employee-report-meta">
            <span className="employee-report-employee">
              {employeeSummary.employee?.name}
            </span>
            <span className="employee-report-cycle">
              {employeeSummary.review_cycle?.name}
            </span>
            <span className="employee-report-period">
              {employeeSummary.review_cycle?.period}
            </span>
          </div>
        </div>

        <div className="employee-report-grid">
          <div className="employee-report-main">
            <EmployeeSummary summary={employeeSummary} />
            <EmployeeReviewTimeline timeline={employeeSummary.timeline} />
          </div>
          <div className="employee-report-sidebar">
            <EmployeeCompetencyComparison comparison={employeeSummary.competency_comparison} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;