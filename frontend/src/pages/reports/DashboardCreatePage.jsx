// frontend/src/pages/reports/DashboardCreatePage.jsx
import React from 'react';
import { DashboardCreate } from '../../components/reports/dashboards';
import './reports.css';

export const DashboardCreatePage = () => {
    return (
        <div className="dashboard-create-page">
            <DashboardCreate />
        </div>
    );
};

export default DashboardCreatePage;