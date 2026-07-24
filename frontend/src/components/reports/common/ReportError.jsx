// frontend/src/components/reports/common/ReportError.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportError = ({
    error,
    onRetry,
    title = 'Something went wrong',
    className = '',
}) => {
    const getErrorMessage = () => {
        if (typeof error === 'string') return error;
        if (error?.message) return error.message;
        if (error?.error) return error.error;
        return 'An unexpected error occurred. Please try again.';
    };

    const getErrorCode = () => {
        if (error?.code) return error.code;
        if (error?.status) return `Error ${error.status}`;
        return null;
    };

    return (
        <div className={`report-error ${className}`}>
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">{title}</h3>
            <p className="error-message">{getErrorMessage()}</p>
            {getErrorCode() && (
                <span className="error-code">{getErrorCode()}</span>
            )}
            {onRetry && (
                <button className="btn btn-primary error-retry" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
};

ReportError.propTypes = {
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRetry: PropTypes.func,
    title: PropTypes.string,
    className: PropTypes.string,
};