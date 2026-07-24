// frontend/src/components/reports/schedules/ScheduleStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiPauseCircle, FiClock, FiPlay, FiAlertCircle } from 'react-icons/fi';
import './schedules.css';

export const ScheduleStatusBadge = ({
    isActive = true,
    isPaused = false,
    status = 'pending',
    size = 'medium',
    showLabels = true,
}) => {
    const getSizeClass = () => {
        const sizes = {
            small: 'badge-small',
            medium: 'badge-medium',
            large: 'badge-large',
        };
        return sizes[size] || 'badge-medium';
    };

    const getStatusConfig = () => {
        if (isPaused) {
            return {
                icon: <FiPauseCircle size={size === 'small' ? 12 : 14} />,
                label: 'Paused',
                className: 'paused',
            };
        }
        if (!isActive) {
            return {
                icon: <FiXCircle size={size === 'small' ? 12 : 14} />,
                label: 'Inactive',
                className: 'inactive',
            };
        }
        const configs = {
            pending: { icon: <FiClock size={size === 'small' ? 12 : 14} />, label: 'Pending', className: 'pending' },
            running: { icon: <FiPlay size={size === 'small' ? 12 : 14} />, label: 'Running', className: 'running' },
            completed: { icon: <FiCheckCircle size={size === 'small' ? 12 : 14} />, label: 'Completed', className: 'completed' },
            failed: { icon: <FiAlertCircle size={size === 'small' ? 12 : 14} />, label: 'Failed', className: 'failed' },
            cancelled: { icon: <FiXCircle size={size === 'small' ? 12 : 14} />, label: 'Cancelled', className: 'cancelled' },
        };
        return configs[status] || configs.pending;
    };

    const config = getStatusConfig();

    return (
        <span className={`schedule-status-badge ${getSizeClass()} ${config.className}`}>
            {config.icon}
            {showLabels && <span className="badge-label">{config.label}</span>}
        </span>
    );
};

ScheduleStatusBadge.propTypes = {
    isActive: PropTypes.bool,
    isPaused: PropTypes.bool,
    status: PropTypes.oneOf(['pending', 'running', 'completed', 'failed', 'cancelled']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabels: PropTypes.bool,
};