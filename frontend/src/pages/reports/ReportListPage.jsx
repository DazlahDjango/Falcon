// frontend/src/pages/reports/ReportListPage.jsx
import React from 'react';
import { ReportList } from '../../components/reports/reports';
import './reports.css';

export const ReportListPage = () => {
    return (
        <div className="report-list-page">
            <ReportList />
        </div>
    );
};

export default ReportListPage;