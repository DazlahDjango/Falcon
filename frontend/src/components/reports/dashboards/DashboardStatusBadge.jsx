// frontend/src/components/reports/dashboards/DashboardStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiShare2, FiEye } from 'react-icons/fi';
import './dashboards.css';

export const DashboardStatusBadge = ({
    isPublished = false,
    isShared = false,
    size = 'medium',
    showLabels = true,
}) => {
    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    const badges = [];

    badges.push({
        icon: isPublished ? <FiCheckCircle size={size === 'small' ? 12 : 14} /> : <FiXCircle size={size === 'small' ? 12 : 14} />,
        label: isPublished ? 'Published' : 'Draft',
        className: isPublished ? 'published' : 'draft',
    });

    if (isShared) {
        badges.push({
            icon: <FiShare2 size={size === 'small' ? 12 : 14} />,
            label: 'Shared',
            className: 'shared',
        });
    }

    return (
        <div className={`dashboard-status-badges ${sizeClasses[size]}`}>
            {badges.map((badge, index) => (
                <span key={index} className={`status-badge ${badge.className}`}>
                    {badge.icon}
                    {showLabels && <span className="badge-label">{badge.label}</span>}
                </span>
            ))}
        </div>
    );
};

DashboardStatusBadge.propTypes = {
    isPublished: PropTypes.bool,
    isShared: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabels: PropTypes.bool,
};