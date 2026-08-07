// src/pages/reviews/reports/TeamReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useReviewsPermissions, useCycles } from '../../../hooks/reviews';
import { useEmployees } from '../../../hooks/accounts';
import { TeamReport } from '../../../components/reviews/reports';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';
import '../pages.css';

const TeamReportPage = () => {
  const navigate = useNavigate();
  const { canViewReports } = useReviewsPermissions();
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: cycles, fetchAll: fetchCycles, loading: cyclesLoading } = useCycles();

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  if (!canViewReports) {
    return (
      <div className="reviews-page">
        <div className="reviews-page-unauthorized">
          <h2>Access Denied</h2>
          <p>You do not have permission to view team reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <button className="reviews-page-back" onClick={() => navigate('/reviews/reports')}>
          <ArrowLeft size={20} />
          Back to Reports
        </button>
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports' },
            { label: 'Team Report', path: '/reviews/reports/team', isActive: true },
          ]}
        />
        <h1 className="reviews-page-title flex items-center gap-2">
          <Users size={28} className="text-purple-600" />
          Team Performance Report
        </h1>
      </div>

      <div className="reviews-page-filters">
        <div className="reviews-page-filter-group">
          <label className="reviews-page-filter-label">Select Manager</label>
          <select
            className="reviews-page-filter-select"
            value={selectedManager || ''}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">Select manager...</option>
            {employeesLoading ? (
              <option disabled>Loading managers...</option>
            ) : (
              employees && employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="reviews-page-filter-group">
          <label className="reviews-page-filter-label">Select Cycle</label>
          <select
            className="reviews-page-filter-select"
            value={selectedCycle || ''}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="">Select cycle...</option>
            {cyclesLoading ? (
              <option disabled>Loading cycles...</option>
            ) : (
              cycles && cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedManager && selectedCycle ? (
        <div className="reviews-page-section">
          <div className="reviews-page-section-content">
            <TeamReport managerId={selectedManager} cycleId={selectedCycle} />
          </div>
        </div>
      ) : (
        <div className="reviews-page-empty">
          <Users size={48} color="#d1d5db" className="mx-auto mb-4" />
          <h3>Select Manager and Cycle</h3>
          <p>Please select a manager and a review cycle to view the team report.</p>
        </div>
      )}
    </div>
  );
};

export default TeamReportPage;