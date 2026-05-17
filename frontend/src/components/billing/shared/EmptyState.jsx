import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from './BillingIcons';

export const EmptyState = ({ 
    title, 
    message, 
    icon = renderBillingIcon('info', { size: 32 }),
    action = null,
    variant = 'default'
}) => {
    return (
        <div className={`empty-state empty-state-${variant}`}>
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
            {action && <div className="empty-state-action">{action}</div>}
        </div>
    );
};

EmptyState.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    icon: PropTypes.node,
    action: PropTypes.node,
    variant: PropTypes.oneOf(['default', 'compact']),
};

export default EmptyState;