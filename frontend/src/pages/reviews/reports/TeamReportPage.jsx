// src/pages/reviews/reports/TeamReportPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { TeamReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const TeamReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports, isSupervisor, isAdmin } = useReviewsPermissions();
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  if (!canViewReports) {
    return (
      <div className="team-report-page">
        <div className="team-report-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view team reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-report-page">
      <div className="team-report-page-header">
        <button className="team-report-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Team Report', path: '/reviews/reports/team', isActive: true },
          ]}
        />
        <h1 className="team-report-page-title">Team Performance Report</h1>
      </div>

      <div className="team-report-page-filters">
        <div className="team-report-page-filter-group">
          <label className="team-report-page-filter-label">Select Manager</label>
          <select
            className="team-report-page-filter-select"
            value={selectedManager || ''}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">Select manager...</option>
            {/* Manager options would be populated from API */}
          </select>
        </div>
        <div className="team-report-page-filter-group">
          <label className="team-report-page-filter-label">Select Cycle</label>
          <select
            className="team-report-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {/* Cycle options would be populated from API */}
          </select>
        </div>
      </div>

      {selectedManager && selectedCycle ? (
        <TeamReport />
      ) : (
        <div className="team-report-page-empty">
          <Users size={48} color="#d1d5db" />
          <h3>Select Manager and Cycle</h3>
          <p>Please select a manager and a review cycle to view the team report.</p>
        </div>
      )}
    </div>
  );
};

export default TeamReportPage;