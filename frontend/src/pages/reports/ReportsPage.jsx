// frontend/src/pages/reports/ReportsPage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import './reports.css';

export const ReportsPage = () => {
    return (
        <div className="reports-page">
            <Outlet />
        </div>
    );
};

export default ReportsPage;