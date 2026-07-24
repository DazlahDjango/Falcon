// frontend/src/pages/reports/ExportsPage.jsx
import React from 'react';
import { ExportList } from '../../components/reports/exports';
import './reports.css';

export const ExportsPage = () => {
    return (
        <div className="exports-page">
            <ExportList />
        </div>
    );
};

export default ExportsPage;