// frontend/src/components/reports/templates/TemplateStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiStar, FiCpu } from 'react-icons/fi';
import './templates.css';

export const TemplateStatusBadge = ({
    isPublished = false,
    isDefault = false,
    isSystem = false,
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

    const badges = [];

    if (isPublished) {
        badges.push({
            icon: <FiCheckCircle size={size === 'small' ? 12 : 14} />,
            label: 'Published',
            className: 'published',
        });
    } else {
        badges.push({
            icon: <FiXCircle size={size === 'small' ? 12 : 14} />,
            label: 'Draft',
            className: 'draft',
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
        <div className={`template-status-badges ${getSizeClass()}`}>
            {badges.map((badge, index) => (
                <span key={index} className={`status-badge ${badge.class}`}>
                    {badge.icon}
                    {showLabels && <span className="badge-label">{badge.label}</span>}
                </span>
            ))}
        </div>
    );
};

TemplateStatusBadge.propTypes = {
    isPublished: PropTypes.bool,
    isDefault: PropTypes.bool,
    isSystem: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabels: PropTypes.bool,
};