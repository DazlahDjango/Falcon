// frontend/src/pages/reports/AnalyticsPage.jsx
import React from 'react';
import { AnalyticsDashboard } from '../../components/reports/analytics';
import './reports.css';

export const AnalyticsPage = () => {
    return (
        <div className="analytics-page">
            <AnalyticsDashboard />
        </div>
    );
};

export default AnalyticsPage;