// frontend/src/pages/reports/DashboardDetailPage.jsx
import React from 'react';
import { DashboardDetail } from '../../components/reports/dashboards';
import './reports.css';

export const DashboardDetailPage = () => {
    return (
        <div className="dashboard-detail-page">
            <DashboardDetail />
        </div>
    );
};

export default DashboardDetailPage;