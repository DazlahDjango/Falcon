import React from 'react';
import { useSelector } from 'react-redux';
import { AlertList } from '../../../components/dashboard/alerts';
import { RedAlertWidget } from '../../../components/dashboard/widgets';
import { selectExecutiveIssues, selectExecutiveLoading } from '../../../store/dashboard/selectors/dashboardSelectors';

export const ExecutiveAlerts = () => {
  const issues = useSelector(selectExecutiveIssues);
  const loading = useSelector(selectExecutiveLoading);

  return (
    <div className="executive-alerts-page">
      <div className="page-header">
        <h1>Alerts & Notifications</h1>
        <p>Critical issues requiring immediate attention</p>
      </div>
      
      <div className="alerts-grid">
        <RedAlertWidget
          data={issues}
          loading={loading}
          title="Critical Alerts"
          onRefresh={() => {}}
        />
        
        <AlertList
          alerts={issues}
          loading={loading}
          title="All Alerts"
          onRefresh={() => {}}
        />
      </div>
    </div>
  );
};