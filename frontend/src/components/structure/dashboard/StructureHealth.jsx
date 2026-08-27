import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiDatabase,
  FiServer,
  FiCpu,
  FiShield,
  FiBarChart2,
  FiClock,
} from 'react-icons/fi';
import { useStructureHealth } from '../../../hooks/structure';
import { StructureLoading, StructureEmptyState, StructureStatusBadge } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './dashboard.css';

export const StructureHealth = () => {
  const navigate = useNavigate();
  const { database, cache, services, admin, metrics, isLoading, error, fetchAll, clearError } = useStructureHealth({
    autoFetch: true,
  });

  const [activeTab, setActiveTab] = useState('all');

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.BASE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  if (isLoading) {
    return (
      <div className="health-loading">
        <StructureLoading text="Loading health data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-error">
        <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const HealthCard = ({ icon: Icon, title, data, statusKey = 'status' }) => {
    const isHealthy = data?.[statusKey] === 'healthy';
    const status = data?.[statusKey] || 'unknown';

    return (
      <div className={`health-card ${isHealthy ? 'healthy' : 'unhealthy'}`}>
        <div className="health-card-header">
          <Icon size={24} />
          <h3>{title}</h3>
          <StructureStatusBadge
            status={isHealthy ? 'active' : 'inactive'}
            customLabel={isHealthy ? 'Healthy' : 'Unhealthy'}
            size="sm"
          />
        </div>
        <div className="health-card-body">
          {data ? (
            Object.entries(data).map(([key, value]) => {
              if (typeof value === 'object' || key === 'status' || key === 'timestamp') return null;
              return (
                <div key={key} className="health-detail-row">
                  <span className="health-detail-label">{key.replace(/_/g, ' ')}</span>
                  <span className="health-detail-value">{String(value)}</span>
                </div>
              );
            })
          ) : (
            <p className="health-no-data">No data available</p>
          )}
        </div>
      </div>
    );
  };

  const metricsData = metrics || {};
  const counts = metricsData.counts || {};
  const ratios = metricsData.ratios || {};

  return (
    <div className="health-container">
      <div className="health-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Structure Health</h1>
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="health-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FiActivity size={16} />
          All Services
        </button>
        <button
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <FiDatabase size={16} />
          Database
        </button>
        <button
          className={`tab-btn ${activeTab === 'cache' ? 'active' : ''}`}
          onClick={() => setActiveTab('cache')}
        >
          <FiServer size={16} />
          Cache
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <FiCpu size={16} />
          Services
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <FiBarChart2 size={16} />
          Metrics
        </button>
        <button
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <FiShield size={16} />
          Admin
        </button>
      </div>

      <div className="health-content">
        {activeTab === 'all' && (
          <div className="health-grid">
            <HealthCard icon={FiDatabase} title="Database" data={database} />
            <HealthCard icon={FiServer} title="Cache" data={cache} />
            <HealthCard icon={FiCpu} title="Services" data={services} />
            <HealthCard icon={FiShield} title="Admin" data={admin} />
          </div>
        )}

        {activeTab === 'database' && (
          <div className="health-single">
            <HealthCard icon={FiDatabase} title="Database Health" data={database} />
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="health-single">
            <HealthCard icon={FiServer} title="Cache Health" data={cache} />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="health-single">
            <HealthCard icon={FiCpu} title="Services Health" data={services} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="health-single">
            <HealthCard icon={FiShield} title="Admin Health" data={admin} />
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="health-metrics-view">
            <div className="health-metrics-header">
              <h2>System Metrics</h2>
              <span className="metrics-timestamp">
                <FiClock size={14} />
                {metricsData.timestamp ? new Date(metricsData.timestamp).toLocaleString() : '-'}
              </span>
            </div>

            <div className="metrics-section">
              <h3>Counts</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Organizational Units</span>
                  <span className="metric-value">{counts.organizational_units || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Divisions</span>
                  <span className="metric-value">{counts.divisions || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Departments</span>
                  <span className="metric-value">{counts.departments || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Sections</span>
                  <span className="metric-value">{counts.sections || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Units</span>
                  <span className="metric-value">{counts.units || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Employments</span>
                  <span className="metric-value">{counts.employments || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Current Employments</span>
                  <span className="metric-value">{counts.current_employments || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Positions</span>
                  <span className="metric-value">{counts.positions || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Reporting Lines</span>
                  <span className="metric-value">{counts.reporting_lines || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Active Reporting Lines</span>
                  <span className="metric-value">{counts.active_reporting_lines || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Cost Centers</span>
                  <span className="metric-value">{counts.cost_centers || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Locations</span>
                  <span className="metric-value">{counts.locations || 0}</span>
                </div>
              </div>
            </div>

            <div className="metrics-section">
              <h3>Ratios</h3>
              <div className="ratios-grid">
                <div className="ratio-item">
                  <span className="ratio-label">Avg Units per Department</span>
                  <span className="ratio-value">{ratios.avg_units_per_department || 0}</span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Avg Employees per Unit</span>
                  <span className="ratio-value">{ratios.avg_employees_per_unit || 0}</span>
                </div>
                <div className="ratio-item">
                  <span className="ratio-label">Reporting Line Activation Rate</span>
                  <span className="ratio-value">{ratios.reporting_line_activation_rate || 0}%</span>
                </div>
              </div>
            </div>

            {admin && admin.anomalies && admin.anomalies.length > 0 && (
              <div className="admin-anomalies">
                <h4>Admin Anomalies</h4>
                <ul>
                  {admin.anomalies.map((anomaly, index) => (
                    <li key={index}>
                      <FiAlertCircle size={14} />
                      <span>{anomaly}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {admin && admin.status === 'healthy' && (
              <div className="health-success-banner">
                <FiCheckCircle size={24} />
                <div>
                  <h4>All Systems Operational</h4>
                  <p>{admin.recommendations?.join(' • ') || 'No anomalies detected'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureHealth;
