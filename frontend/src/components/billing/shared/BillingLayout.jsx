import React from 'react';
import './shared.css';

export const BillingLayout = ({ children, sidebar, header, className = '' }) => {
    return (
        <div className={`billing-layout ${className}`}>
            {header && <div className="billing-layout-header">{header}</div>}
            <div className="billing-layout-container">
                {sidebar && <aside className="billing-layout-sidebar">{sidebar}</aside>}
                <main className="billing-layout-content">{children}</main>
            </div>
        </div>
    );
};

export default BillingLayout;