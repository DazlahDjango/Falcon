// frontend/src/pages/reports/ReportCreatePage.jsx
import React from 'react';
import { ReportCreate } from '../../components/reports/reports';
import './reports.css';

export const ReportCreatePage = () => {
    return (
        <div className="report-create-page">
            <ReportCreate />
        </div>
    );
};

export default ReportCreatePage;