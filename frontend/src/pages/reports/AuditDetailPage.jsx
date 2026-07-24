// frontend/src/pages/reports/AuditDetailPage.jsx
import React from 'react';
import { AuditDetail } from '../../components/reports/audits';
import './reports.css';

export const AuditDetailPage = () => {
    return (
        <div className="audit-detail-page">
            <AuditDetail />
        </div>
    );
};

export default AuditDetailPage;