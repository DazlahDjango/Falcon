import React from 'react';
import PropTypes from 'prop-types';

export const BillingLayout = ({ children, title, subtitle, actions }) => {
    return (
        <div className="billing-layout">
            <div className="billing-layout-header">
                <div className="billing-layout-title-section">
                    {title && <h1 className="billing-layout-title">{title}</h1>}
                    {subtitle && <p className="billing-layout-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="billing-layout-actions">{actions}</div>}
            </div>
            <div className="billing-layout-content">
                {children}
            </div>
        </div>
    );
};
BillingLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    actions: PropTypes.node,
};

export default BillingLayout;