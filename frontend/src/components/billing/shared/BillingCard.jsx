import React from 'react';
import PropTypes from 'prop-types';

export const BillingCard = ({ 
    children, 
    title, 
    icon, 
    action, 
    variant = 'default',
    className = '',
    onClick 
}) => {
    const variants = {
        default: 'billing-card',
        highlight: 'billing-card billing-card-highlight',
        success: 'billing-card billing-card-success',
        warning: 'billing-card billing-card-warning',
        error: 'billing-card billing-card-error',
    };

    return (
        <div className={variants[variant]} onClick={onClick}>
            {(title || icon || action) && (
                <div className="billing-card-header">
                    <div className="billing-card-header-left">
                        {icon && <span className="billing-card-icon">{icon}</span>}
                        {title && <h3 className="billing-card-title">{title}</h3>}
                    </div>
                    {action && <div className="billing-card-action">{action}</div>}
                </div>
            )}
            <div className="billing-card-body">{children}</div>
        </div>
    );
};

BillingCard.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.node,
    icon: PropTypes.node,
    action: PropTypes.node,
    variant: PropTypes.oneOf(['default', 'highlight', 'success', 'warning', 'error']),
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default BillingCard;