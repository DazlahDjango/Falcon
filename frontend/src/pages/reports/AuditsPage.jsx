// frontend/src/pages/reports/AuditsPage.jsx
import React from 'react';
import { AuditList } from '../../components/reports/audits';
import './reports.css';

export const AuditsPage = () => {
    return (
        <div className="audits-page">
            <AuditList />
        </div>
    );
};

export default AuditsPage;