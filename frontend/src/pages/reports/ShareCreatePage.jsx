// frontend/src/pages/reports/ShareCreatePage.jsx
import React from 'react';
import { ShareCreate } from '../../components/reports/shares';
import './reports.css';

export const ShareCreatePage = () => {
    return (
        <div className="share-create-page">
            <ShareCreate />
        </div>
    );
};

export default ShareCreatePage;