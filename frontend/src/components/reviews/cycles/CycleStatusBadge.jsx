// src/components/reviews/cycle/CycleStatusBadge.jsx
import React from 'react';
import { REVIEW_CYCLE_STATUS, REVIEW_CYCLE_STATUS_LABELS } from '@/config/constants';

const statusColorMap = {
    [REVIEW_CYCLE_STATUS.DRAFT]: 'cycle-status-draft',
    [REVIEW_CYCLE_STATUS.ACTIVE]: 'cycle-status-active',
    [REVIEW_CYCLE_STATUS.COMPLETED]: 'cycle-status-completed',
    [REVIEW_CYCLE_STATUS.ARCHIVED]: 'cycle-status-archived',
};

const CycleStatusBadge = ({ status, className = '' }) => {
    const statusClass = statusColorMap[status] || 'cycle-status-draft';
    const label = REVIEW_CYCLE_STATUS_LABELS[status] || status;
    
    return (
        <span className={`cycle-status-badge ${statusClass} ${className}`}>
            {label}
        </span>
    );
};

export default CycleStatusBadge;