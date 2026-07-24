// frontend/src/components/reports/common/ReportStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportStatusBadge = ({ status, size = 'medium', showLabel = true }) => {
    const getStatusConfig = (status) => {
        const configs = {
            draft: { label: 'Draft', color: '#94a3b8', icon: '📝' },
            queued: { label: 'Queued', color: '#f59e0b', icon: '⏳' },
            generating: { label: 'Generating', color: '#3b82f6', icon: '🔄' },
            completed: { label: 'Completed', color: '#10b981', icon: '✅' },
            failed: { label: 'Failed', color: '#ef4444', icon: '❌' },
            archived: { label: 'Archived', color: '#64748b', icon: '📦' },
        };
        return configs[status] || configs.draft;
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`report-status-badge size-${size}`}
            style={{ backgroundColor: config.color }}
        >
            <span className="status-icon">{config.icon}</span>
            {showLabel && <span className="status-label">{config.label}</span>}
        </span>
    );
};

ReportStatusBadge.propTypes = {
    status: PropTypes.oneOf(['draft', 'queued', 'generating', 'completed', 'failed', 'archived']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabel: PropTypes.bool,
};