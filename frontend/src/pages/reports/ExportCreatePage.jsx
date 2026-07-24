// frontend/src/pages/reports/ExportCreatePage.jsx
import React from 'react';
import { ExportCreate } from '../../components/reports/exports';
import './reports.css';

export const ExportCreatePage = () => {
    return (
        <div className="export-create-page">
            <ExportCreate />
        </div>
    );
};

export default ExportCreatePage;