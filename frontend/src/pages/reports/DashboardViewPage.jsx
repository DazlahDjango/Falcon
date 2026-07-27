// frontend/src/pages/reports/DashboardViewPage.jsx
import React from 'react';
import { DashboardView } from '../../components/reports/dashboards';
import './reports.css';

export const DashboardViewPage = () => {
    return (
        <div className="dashboard-view-page">
            <DashboardView />
        </div>
    );
};

export default DashboardViewPage;