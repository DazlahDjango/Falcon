// frontend/src/pages/reports/ReportGeneratePage.jsx
import React from 'react';
import { ReportGenerate } from '../../components/reports/reports';
import './reports.css';

export const ReportGeneratePage = () => {
    return (
        <div className="report-generate-page">
            <ReportGenerate />
        </div>
    );
};

export default ReportGeneratePage;