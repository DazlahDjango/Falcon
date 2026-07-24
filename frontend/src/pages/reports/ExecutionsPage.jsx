// frontend/src/pages/reports/ExecutionsPage.jsx
import React from 'react';
import { ExecutionList } from '../../components/reports/executions';
import './reports.css';

export const ExecutionsPage = () => {
    return (
        <div className="executions-page">
            <ExecutionList />
        </div>
    );
};

export default ExecutionsPage;