// src/components/reviews/pip/PIPStatusBadge.jsx
import React from 'react';
import './pip.css';
import { REVIEW_PIP_STATUS, REVIEW_PIP_STATUS_LABELS, REVIEW_PIP_SEVERITY, REVIEW_PIP_SEVERITY_LABELS } from '@/config/constants';

const statusColorMap = {
    [REVIEW_PIP_STATUS.DRAFT]: 'pip-status-draft',
    [REVIEW_PIP_STATUS.ACTIVE]: 'pip-status-active',
    [REVIEW_PIP_STATUS.COMPLETED]: 'pip-status-completed',
    [REVIEW_PIP_STATUS.FAILED]: 'pip-status-failed',
};

const severityColorMap = {
    [REVIEW_PIP_SEVERITY.MINOR]: 'pip-severity-minor',
    [REVIEW_PIP_SEVERITY.MODERATE]: 'pip-severity-moderate',
    [REVIEW_PIP_SEVERITY.SEVERE]: 'pip-severity-severe',
    [REVIEW_PIP_SEVERITY.CRITICAL]: 'pip-severity-critical',
};

const PIPStatusBadge = ({ status, severity, showSeverity = false, className = '' }) => {
    const statusClass = statusColorMap[status] || 'pip-status-draft';
    const statusLabel = REVIEW_PIP_STATUS_LABELS[status] || status;
    
    const severityClass = severityColorMap[severity] || 'pip-severity-moderate';
    const severityLabel = REVIEW_PIP_SEVERITY_LABELS[severity] || severity;

    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`pip-status-badge ${statusClass} ${className}`}>
                {statusLabel}
            </span>
            {showSeverity && severity && (
                <span className={`pip-status-badge ${severityClass} ${className}`}>
                    {severityLabel}
                </span>
            )}
        </div>
    );
};

export default PIPStatusBadge;