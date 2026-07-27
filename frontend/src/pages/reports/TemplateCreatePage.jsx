// frontend/src/pages/reports/TemplateCreatePage.jsx
import React from 'react';
import { TemplateCreate } from '../../components/reports/templates';
import './reports.css';

export const TemplateCreatePage = () => {
    return (
        <div className="template-create-page">
            <TemplateCreate />
        </div>
    );
};

export default TemplateCreatePage;