// frontend/src/pages/reports/ExportDetailPage.jsx
import React from 'react';
import { ExportDetail } from '../../components/reports/exports';
import './reports.css';

export const ExportDetailPage = () => {
    return (
        <div className="export-detail-page">
            <ExportDetail />
        </div>
    );
};

export default ExportDetailPage;