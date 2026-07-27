// frontend/src/pages/reports/DashboardsPage.jsx
import React from 'react';
import { DashboardList } from '../../components/reports/dashboards';
import './reports.css';

export const DashboardsPage = () => {
    return (
        <div className="dashboards-page">
            <DashboardList />
        </div>
    );
};

export default DashboardsPage;