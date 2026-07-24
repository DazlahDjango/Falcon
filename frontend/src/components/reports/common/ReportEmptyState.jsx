// frontend/src/components/reports/common/ReportEmptyState.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportEmptyState = ({
    title = 'No Reports Found',
    description = 'There are no reports available at this time.',
    icon = '📄',
    actionText = 'Create Report',
    onAction,
    className = '',
}) => {
    return (
        <div className={`report-empty-state ${className}`}>
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {onAction && (
                <button className="btn btn-primary empty-state-action" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
};

ReportEmptyState.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
    actionText: PropTypes.string,
    onAction: PropTypes.func,
    className: PropTypes.string,
};