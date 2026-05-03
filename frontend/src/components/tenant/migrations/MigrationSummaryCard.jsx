// frontend/src/components/tenant/migrations/MigrationSummaryCard.jsx
import React from 'react';
import './migrations.css';

export const MigrationSummaryCard = ({ title, value, type = 'default' }) => {
    let cardClass = 'migration-summary-card';

    if (type === 'pending') {
        cardClass += ' migration-summary-card-pending';
    } else if (type === 'completed') {
        cardClass += ' migration-summary-card-completed';
    } else if (type === 'failed') {
        cardClass += ' migration-summary-card-failed';
    }

    return (
        <div className={cardClass}>
            <div className="migration-summary-card-value">{value}</div>
            <div className="migration-summary-card-label">{title}</div>
        </div>
    );
};