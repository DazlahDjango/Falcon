// frontend/src/pages/reports/WidgetCreatePage.jsx
import React from 'react';
import { WidgetCreate } from '../../components/reports/widgets';
import './reports.css';

export const WidgetCreatePage = () => {
    return (
        <div className="widget-create-page">
            <WidgetCreate />
        </div>
    );
};

export default WidgetCreatePage;
