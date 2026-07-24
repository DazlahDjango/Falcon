// frontend/src/components/reports/reports/ReportStatus.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiPlay, FiArchive } from 'react-icons/fi';
import './reports.css';

export const ReportStatus = ({ status, showLabel = true, size = 'medium' }) => {
    const getStatusConfig = (status) => {
        const configs = {
            draft: {
                icon: FiClock,
                label: 'Draft',
                color: '#94a3b8',
                bgColor: '#f1f5f9',
            },
            queued: {
                icon: FiAlertCircle,
                label: 'Queued',
                color: '#f59e0b',
                bgColor: '#fef3c7',
            },
            generating: {
                icon: FiPlay,
                label: 'Generating',
                color: '#3b82f6',
                bgColor: '#dbeafe',
            },
            completed: {
                icon: FiCheckCircle,
                label: 'Completed',
                color: '#10b981',
                bgColor: '#d1fae5',
            },
            failed: {
                icon: FiXCircle,
                label: 'Failed',
                color: '#ef4444',
                bgColor: '#fee2e2',
            },
            archived: {
                icon: FiArchive,
                label: 'Archived',
                color: '#64748b',
                bgColor: '#f1f5f9',
            },
        };
        return configs[status] || configs.draft;
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        small: 'status-small',
        medium: 'status-medium',
        large: 'status-large',
    };

    return (
        <span
            className={`report-status ${sizeClasses[size]}`}
            style={{ backgroundColor: config.bgColor, color: config.color }}
        >
            <Icon size={size === 'small' ? 12 : size === 'large' ? 20 : 16} />
            {showLabel && <span className="status-label">{config.label}</span>}
        </span>
    );
};

ReportStatus.propTypes = {
    status: PropTypes.oneOf(['draft', 'queued', 'generating', 'completed', 'failed', 'archived']),
    showLabel: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};