// src/components/reviews/dashboard/supervisor/SupervisorAlerts.jsx
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

const SupervisorAlerts = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="supervisor-alerts supervisor-alerts-none">
        <CheckCircle size={20} color="#22c55e" />
        <span>All caught up! No alerts.</span>
      </div>
    );
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'medium':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return <Bell size={16} color="#3b82f6" />;
    }
  };

  const getAlertClass = (severity) => {
    switch (severity) {
      case 'high':
        return 'supervisor-alerts-item-high';
      case 'medium':
        return 'supervisor-alerts-item-medium';
      default:
        return 'supervisor-alerts-item-low';
    }
  };

  return (
    <div className="supervisor-alerts">
      <div className="supervisor-alerts-header">
        <h3 className="supervisor-alerts-title">
          <Bell size={18} />
          Alerts ({alerts.length})
        </h3>
      </div>
      <div className="supervisor-alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`supervisor-alerts-item ${getAlertClass(alert.severity)}`}>
            {getAlertIcon(alert.severity)}
            <span className="supervisor-alerts-item-message">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisorAlerts;