import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiRefreshCw,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiGitBranch,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiTrendingUp,
  FiBarChart2,
  FiActivity,
} from 'react-icons/fi';
import { useStructureDashboard } from '../../../hooks/structure';
import { StructureLoading, StructureEmptyState, StructureStatusBadge } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './dashboard.css';

export const StructureDashboard = () => {
  const navigate = useNavigate();
  const { overview, health, trends, isLoading, error, fetchAll, clearError } = useStructureDashboard({
    autoFetch: true,
    months: 6,
  });

  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = useCallback(() => {
    fetchAll(6);
  }, [fetchAll]);

  const handleViewAll = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <StructureLoading text="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, subValue, color = 'primary', onClick }) => (
    <div className={`dash-stat-card dash-stat-card-${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="dash-stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-value">{value}</span>
        {subValue && <span className="dash-stat-sub">{subValue}</span>}
      </div>
    </div>
  );

  const orgUnits = overview?.organizational_units || {};
  const employments = overview?.employments || {};
  const positions = overview?.positions || {};
  const locations = overview?.locations || {};
  const costCenters = overview?.cost_centers || {};

  const healthData = health || {};
  const trendsData = trends || {};

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getHealthStatus = (score) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Warning';
    return 'Critical';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Structure Dashboard</h1>
          <span className="header-subtitle">Overview of your organizational structure</span>
        </div>
        <div className="header-right">
          <div className="health-indicator">
            <span className="health-label">Health Score</span>
            <span className={`health-score health-${getHealthColor(healthData.health_score || 100)}`}>
              {healthData.health_score || 100}%
            </span>
            <StructureStatusBadge
              status={healthData.health_score >= 80 ? 'active' : healthData.health_score >= 50 ? 'pending' : 'inactive'}
              customLabel={getHealthStatus(healthData.health_score || 100)}
              size="sm"
            />
          </div>
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 size={16} />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <FiActivity size={16} />
          Health
        </button>
        <button
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <FiTrendingUp size={16} />
          Trends
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-content">
          <div className="dash-stats-grid">
            <StatCard
              icon={FiLayers}
              label="Organizational Units"
              value={orgUnits.total || 0}
              subValue={`${orgUnits.active || 0} active`}
              color="primary"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.ORG_UNITS)}
            />
            <StatCard
              icon={FiGitBranch}
              label="Divisions"
              value={orgUnits.level_distribution?.division || 0}
              color="info"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.DIVISIONS)}
            />
            <StatCard
              icon={FiLayers}
              label="Departments"
              value={orgUnits.level_distribution?.department || 0}
              color="success"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.DEPARTMENTS)}
            />
            <StatCard
              icon={FiBriefcase}
              label="Sections"
              value={orgUnits.level_distribution?.section || 0}
              color="warning"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.SECTIONS)}
            />
            <StatCard
              icon={FiMapPin}
              label="Units"
              value={orgUnits.level_distribution?.unit || 0}
              color="secondary"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.UNITS)}
            />
            <StatCard
              icon={FiUsers}
              label="Current Employments"
              value={employments.total_current || 0}
              subValue={`${employments.managers || 0} managers`}
              color="primary"
              onClick={() => handleViewAll(STRUCTURE_ROUTES.EMPLOYMENTS)}
            />
          </div>

          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Detailed Metrics</h2>
            </div>
            <div className="dash-metrics-grid">
              <div className="metric-card">
                <h4>Positions</h4>
                <div className="metric-row">
                  <span className="metric-label">Total</span>
                  <span className="metric-value">{positions.total || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Occupied</span>
                  <span className="metric-value">{positions.occupied || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Vacant</span>
                  <span className="metric-value">{positions.vacant || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Occupancy Rate</span>
                  <span className="metric-value">{positions.occupancy_rate || 0}%</span>
                </div>
              </div>

              <div className="metric-card">
                <h4>Locations</h4>
                <div className="metric-row">
                  <span className="metric-label">Active Locations</span>
                  <span className="metric-value">{locations.total_active || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Countries</span>
                  <span className="metric-value">{locations.countries || 0}</span>
                </div>
              </div>

              <div className="metric-card">
                <h4>Cost Centers</h4>
                <div className="metric-row">
                  <span className="metric-label">Active</span>
                  <span className="metric-value">{costCenters.total_active || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Total Budget</span>
                  <span className="metric-value">
                    ${(costCenters.total_budget || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <h4>Employments</h4>
                <div className="metric-row">
                  <span className="metric-label">Current</span>
                  <span className="metric-value">{employments.total_current || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Managers</span>
                  <span className="metric-value">{employments.managers || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Executives</span>
                  <span className="metric-value">{employments.executives || 0}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Management %</span>
                  <span className="metric-value">{employments.management_percentage || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="dashboard-content">
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Hierarchy Health</h2>
              <div className="health-summary">
                <span className={`health-score-badge health-${getHealthColor(healthData.health_score || 100)}`}>
                  {healthData.health_score || 100}%
                </span>
                <span className="health-status-text">{getHealthStatus(healthData.health_score || 100)}</span>
              </div>
            </div>

            <div className="health-metrics-grid">
              <div className="health-metric-card">
                <div className="health-metric-icon">
                  <FiAlertCircle size={20} />
                </div>
                <div>
                  <span className="health-metric-label">Issues</span>
                  <span className="health-metric-value">{healthData.issues?.length || 0}</span>
                </div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-icon">
                  <FiGitBranch size={20} />
                </div>
                <div>
                  <span className="health-metric-label">Cycles Detected</span>
                  <span className="health-metric-value">{healthData.details?.cycles || 0}</span>
                </div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-icon">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <span className="health-metric-label">Integrity Issues</span>
                  <span className="health-metric-value">{healthData.details?.integrity_issues || 0}</span>
                </div>
              </div>
              <div className="health-metric-card">
                <div className="health-metric-icon">
                  <FiUsers size={20} />
                </div>
                <div>
                  <span className="health-metric-label">Managers with Warning</span>
                  <span className="health-metric-value">{healthData.details?.managers_with_span_warning || 0}</span>
                </div>
              </div>
            </div>

            {healthData.issues && healthData.issues.length > 0 && (
              <div className="health-issues-list">
                <h4>Issues Found</h4>
                <ul>
                  {healthData.issues.map((issue, index) => (
                    <li key={index}>
                      <FiAlertCircle size={14} />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {healthData.status === 'healthy' && (
              <div className="health-success-banner">
                <FiCheckCircle size={24} />
                <div>
                  <h4>All Systems Healthy</h4>
                  <p>Your organizational structure is in good health. No critical issues detected.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="dashboard-content">
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Trends</h2>
              <span className="trend-period">Last 6 months</span>
            </div>

            {trendsData.trends && trendsData.trends.length > 0 ? (
              <div className="trends-list">
                {trendsData.trends.map((trend, index) => (
                  <div key={index} className="trend-item">
                    <div className="trend-date">{trend.date}</div>
                    <div className="trend-details">
                      <span className="trend-label">Version {trend.version_number}</span>
                      <span className="trend-value">{trend.units_count} units</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="trends-empty">
                <p>No trend data available</p>
              </div>
            )}

            <div className="trend-summary">
              <div className="trend-summary-item">
                <span className="summary-label">Period</span>
                <span className="summary-value">{trendsData.period_months || 0} months</span>
              </div>
              <div className="trend-summary-item">
                <span className="summary-label">Total Versions</span>
                <span className="summary-value">{trendsData.trends?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructureDashboard;