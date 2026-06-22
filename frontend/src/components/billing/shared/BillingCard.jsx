import React from 'react';
import './shared.css';

export const BillingCard = ({ title, subtitle, icon, children, footer, loading = false, className = '', headerAction = null }) => {
    if (loading) {
        return (
            <div className={`billing-card billing-card-loading ${className}`}>
                <div className="billing-card-skeleton">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-line"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`billing-card ${className}`}>
            {(title || headerAction) && (
                <div className="billing-card-header">
                    <div className="billing-card-header-left">
                        {icon && <div className="billing-card-icon">{icon}</div>}
                        <div>
                            {title && <h3 className="billing-card-title">{title}</h3>}
                            {subtitle && <p className="billing-card-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                    {headerAction && <div className="billing-card-header-action">{headerAction}</div>}
                </div>
            )}
            <div className="billing-card-body">{children}</div>
            {footer && <div className="billing-card-footer">{footer}</div>}
        </div>
    );
};

export default BillingCard;