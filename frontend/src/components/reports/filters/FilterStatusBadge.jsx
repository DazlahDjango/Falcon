// frontend/src/components/reports/filters/FilterStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiGlobe, FiUser, FiStar, FiCpu } from 'react-icons/fi';
import './filters.css';

export const FilterStatusBadge = ({
    isGlobal = false,
    isDefault = false,
    isSystem = false,
    size = 'medium',
}) => {
    const badges = [];

    if (isGlobal) {
        badges.push({
            icon: <FiGlobe size={size === 'small' ? 12 : 14} />,
            label: 'Global',
            className: 'global',
        });
    } else {
        badges.push({
            icon: <FiUser size={size === 'small' ? 12 : 14} />,
            label: 'Personal',
            className: 'personal',
        });
    }

    if (isDefault) {
        badges.push({
            icon: <FiStar size={size === 'small' ? 12 : 14} />,
            label: 'Default',
            className: 'default',
        });
    }

    if (isSystem) {
        badges.push({
            icon: <FiCpu size={size === 'small' ? 12 : 14} />,
            label: 'System',
            className: 'system',
        });
    }

    return (
        <div className={`filter-status-badges size-${size}`}>
            {badges.map((badge, index) => (
                <span key={index} className={`badge-item ${badge.className}`}>
                    {badge.icon}
                    {size !== 'small' && <span className="badge-label">{badge.label}</span>}
                </span>
            ))}
        </div>
    );
};

FilterStatusBadge.propTypes = {
    isGlobal: PropTypes.bool,
    isDefault: PropTypes.bool,
    isSystem: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};