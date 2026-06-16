// src/pages/reviews/reports/EmployeeReportPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Search } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { EmployeeReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs, ReviewSearchBar } from '../../../components/reviews/common';

const EmployeeReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports } = useReviewsPermissions();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  if (!canViewReports) {
    return (
      <div className="employee-report-page">
        <div className="employee-report-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view employee reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-report-page">
      <div className="employee-report-page-header">
        <button className="employee-report-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Employee Report', path: '/reviews/reports/employee', isActive: true },
          ]}
        />
        <h1 className="employee-report-page-title">Employee Performance Report</h1>
      </div>

      <div className="employee-report-page-filters">
        <div className="employee-report-page-filter-group">
          <label className="employee-report-page-filter-label">Select Employee</label>
          <select
            className="employee-report-page-filter-select"
            value={selectedEmployee || ''}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Select employee...</option>
            {/* Employee options would be populated from API */}
          </select>
        </div>
        <div className="employee-report-page-filter-group">
          <label className="employee-report-page-filter-label">Select Cycle</label>
          <select
            className="employee-report-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {/* Cycle options would be populated from API */}
          </select>
        </div>
      </div>

      {selectedEmployee && selectedCycle ? (
        <EmployeeReport />
      ) : (
        <div className="employee-report-page-empty">
          <User size={48} color="#d1d5db" />
          <h3>Select Employee and Cycle</h3>
          <p>Please select an employee and a review cycle to view the report.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeReportPage;