// frontend/src/pages/reports/ExecutionDetailPage.jsx
import React from 'react';
import { ExecutionDetail } from '../../components/reports/executions';
import './reports.css';

export const ExecutionDetailPage = () => {
    return (
        <div className="execution-detail-page">
            <ExecutionDetail />
        </div>
    );
};

export default ExecutionDetailPage;