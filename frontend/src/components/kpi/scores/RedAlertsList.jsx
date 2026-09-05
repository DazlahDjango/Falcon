import React from 'react';
import { FiAlertCircle, FiBell } from 'react-icons/fi';
import RedAlertCard from './RedAlertCard';
import KPIEmptyState from '../common/KPIEmptyState';
import KPILoading from '../common/KPILoading';

const RedAlertsList = ({ alerts, loading, title = "Red Alerts", onAlertClick }) => {
    if (loading) {
        return <KPILoading text="Loading alerts..." />;
    }

    if (!alerts || alerts.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiBell size={40} />}
                title="No Red Alerts"
                description="All Performance Indicators are performing within acceptable ranges."
            />
        );
    }

    return (
        <div className="kpi-red-alerts-list">
            <div className="kpi-red-alerts-header">
                <div className="kpi-red-alerts-title">
                    <FiAlertCircle size={20} color="var(--kpi-danger)" />
                    <h3>{title}</h3>
                </div>
                <span className="kpi-red-alerts-count">{alerts.length} alerts</span>
            </div>
            
            <div className="kpi-red-alerts-grid">
                {alerts.map(alert => (
                    <RedAlertCard key={alert.id} alert={alert} onClick={onAlertClick} />
                ))}
            </div>
        </div>
    );
};

export default RedAlertsList;