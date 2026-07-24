// frontend/src/pages/reports/DashboardEditPage.jsx
import React from 'react';
import { DashboardEdit } from '../../components/reports/dashboards';
import './reports.css';

export const DashboardEditPage = () => {
    return (
        <div className="dashboard-edit-page">
            <DashboardEdit />
        </div>
    );
};

export default DashboardEditPage;