// frontend/src/components/reports/widgets/WidgetStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiCheckCircle, FiXCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import './widgets.css';

export const WidgetStatusBadge = ({
    isActive = true,
    isVisible = true,
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

    return (
        <div className={`widget-status-badges ${getSizeClass()}`}>
            <span
                className={`status-badge ${isActive ? 'active' : 'inactive'}`}
                title={isActive ? 'Active' : 'Inactive'}
            >
                {isActive ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                {showLabels && <span className="badge-label">{isActive ? 'Active' : 'Inactive'}</span>}
            </span>
            <span
                className={`status-badge ${isVisible ? 'visible' : 'hidden'}`}
                title={isVisible ? 'Visible' : 'Hidden'}
            >
                {isVisible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                {showLabels && <span className="badge-label">{isVisible ? 'Visible' : 'Hidden'}</span>}
            </span>
        </div>
    );
};

WidgetStatusBadge.propTypes = {
    isActive: PropTypes.bool,
    isVisible: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    showLabels: PropTypes.bool,
};