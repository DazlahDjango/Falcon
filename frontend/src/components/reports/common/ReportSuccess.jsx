// frontend/src/components/reports/common/ReportSuccess.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportSuccess = ({
    title = 'Success!',
    message = 'Operation completed successfully.',
    icon = '✅',
    onClose,
    className = '',
}) => {
    return (
        <div className={`report-success ${className}`}>
            <div className="success-icon">{icon}</div>
            <h3 className="success-title">{title}</h3>
            <p className="success-message">{message}</p>
            {onClose && (
                <button className="btn btn-primary success-close" onClick={onClose}>
                    Close
                </button>
            )}
        </div>
    );
};

ReportSuccess.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    icon: PropTypes.string,
    onClose: PropTypes.func,
    className: PropTypes.string,
};