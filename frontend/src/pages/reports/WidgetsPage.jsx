// frontend/src/pages/reports/WidgetsPage.jsx
import React from 'react';
import { WidgetList } from '../../components/reports/widgets';
import './reports.css';

export const WidgetsPage = () => {
    return (
        <div className="widgets-page">
            <WidgetList />
        </div>
    );
};

export default WidgetsPage;
