// frontend/src/pages/reports/SharesPage.jsx
import React from 'react';
import { ShareList } from '../../components/reports/shares';
import './reports.css';

export const SharesPage = () => {
    return (
        <div className="shares-page">
            <ShareList />
        </div>
    );
};

export default SharesPage;