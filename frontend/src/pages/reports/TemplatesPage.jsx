// frontend/src/pages/reports/TemplatesPage.jsx
import React from 'react';
import { TemplateList } from '../../components/reports/templates';
import './reports.css';

export const TemplatesPage = () => {
    return (
        <div className="templates-page">
            <TemplateList />
        </div>
    );
};

export default TemplatesPage;