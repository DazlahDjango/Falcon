// frontend/src/components/reports/common/ReportLoading.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportLoading = ({
    variant = 'spinner',
    text = 'Loading...',
    size = 'medium',
    className = '',
}) => {
    const getSizeClass = () => {
        const sizes = {
            small: 'loading-small',
            medium: 'loading-medium',
            large: 'loading-large',
        };
        return sizes[size] || 'loading-medium';
    };

    return (
        <div className={`report-loading ${getSizeClass()} ${className}`}>
            {variant === 'spinner' && (
                <div className="loading-spinner">
                    <div className="spinner-ring" />
                    <div className="spinner-ring" />
                    <div className="spinner-ring" />
                    <div className="spinner-ring" />
                </div>
            )}
            {variant === 'skeleton' && (
                <div className="loading-skeleton">
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                </div>
            )}
            {variant === 'dots' && (
                <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                </div>
            )}
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

ReportLoading.propTypes = {
    variant: PropTypes.oneOf(['spinner', 'skeleton', 'dots']),
    text: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    className: PropTypes.string,
};