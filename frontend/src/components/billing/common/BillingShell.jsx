import React, { useState, useEffect } from 'react';
import { BillingBreadcrumb } from './BillingBreadcrumb';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import './common.css';

export const BillingShell = ({ children, title, subtitle, actions, loading = false, breadcrumb = true, className = '' }) => {
    const { permissions } = useBillingPermissions();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <LoadingSkeleton type="card" count={1} />;

    if (loading) {
        return (
            <div className={`billing-shell ${className}`}>
                <div className="billing-shell-header">
                    <div className="billing-shell-title-section">
                        <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
                        <div className="skeleton skeleton-line" style={{ width: '300px' }}></div>
                    </div>
                </div>
                <LoadingSkeleton type="card" count={3} />
            </div>
        );
    }

    const showActions = actions && permissions.canViewBilling;

    return (
        <div className={`billing-shell ${className}`}>
            <div className="billing-shell-header">
                <div className="billing-shell-title-section">
                    {title && <h1 className="billing-shell-title">{title}</h1>}
                    {subtitle && <p className="billing-shell-subtitle">{subtitle}</p>}
                </div>
                {showActions && <div className="billing-shell-actions">{actions}</div>}
            </div>
            {breadcrumb && <BillingBreadcrumb />}
            <div className="billing-shell-content">{children}</div>
        </div>
    );
};

export default BillingShell;