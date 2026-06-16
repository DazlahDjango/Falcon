// src/pages/reviews/reports/ReportsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Gavel, 
  Download,
  TrendingUp,
  User,
  Building,
  Clock
} from 'lucide-react';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { ReviewBreadcrumbs } from '../../../components/reviews/common';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { canViewReports, canExportReports, isAdmin, isExecutive } = useReviewsPermissions();

  const reportTypes = [
    {
      id: 'employee',
      title: 'Employee Report',
      description: 'View detailed performance reports for individual employees',
      icon: <User size={24} />,
      path: '/reviews/reports/employee',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      permission: canViewReports,
    },
    {
      id: 'team',
      title: 'Team Report',
      description: 'View aggregated performance reports for teams',
      icon: <Users size={24} />,
      path: '/reviews/reports/team',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      permission: canViewReports,
    },
    {
      id: 'cycle',
      title: 'Cycle Report',
      description: 'View performance metrics and distribution for review cycles',
      icon: <Calendar size={24} />,
      path: '/reviews/reports/cycle',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      permission: canViewReports,
    },
    {
      id: 'pip',
      title: 'PIP Report',
      description: 'View Performance Improvement Plan analytics and trends',
      icon: <AlertTriangle size={24} />,
      path: '/reviews/reports/pip',
      color: '#ef4444',
      bgColor: '#fee2e2',
      permission: canViewReports || isAdmin || isExecutive,
    },
    {
      id: 'calibration',
      title: 'Calibration Report',
      description: 'View calibration session outcomes and adjustments',
      icon: <Gavel size={24} />,
      path: '/reviews/reports/calibration',
      color: '#06b6d4',
      bgColor: '#cffafe',
      permission: canViewReports || isAdmin || isExecutive,
    },
    {
      id: 'export',
      title: 'Export Reports',
      description: 'Export reports in various formats (PDF, Excel, CSV)',
      icon: <Download size={24} />,
      path: '/reviews/reports/export',
      color: '#22c55e',
      bgColor: '#d1fae5',
      permission: canExportReports,
    },
  ];

  const filteredReports = reportTypes.filter(report => report.permission);

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <ReviewBreadcrumbs
          items={[
            { label: 'Reports', path: '/reviews/reports', isActive: true },
          ]}
        />
        <div className="reports-page-title-section">
          <h1 className="reports-page-title">Reports & Analytics</h1>
          <p className="reports-page-subtitle">
            Access detailed reports and analytics for performance reviews
          </p>
        </div>
      </div>

      <div className="reports-page-grid">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="reports-page-card"
            onClick={() => navigate(report.path)}
          >
            <div className="reports-page-card-icon" style={{ backgroundColor: report.bgColor, color: report.color }}>
              {report.icon}
            </div>
            <div className="reports-page-card-content">
              <h3 className="reports-page-card-title">{report.title}</h3>
              <p className="reports-page-card-description">{report.description}</p>
              <button className="reports-page-card-btn">
                View Report
                <TrendingUp size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="reports-page-empty">
          <FileText size={48} color="#d1d5db" />
          <h3>No Reports Available</h3>
          <p>You do not have permission to view any reports.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;