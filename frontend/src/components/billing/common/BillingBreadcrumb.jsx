import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { BILLING_ROUTES } from '../../../config/constants/billingRouteConstants';

const SEGMENT_LABELS = {
    billing: 'Billing',
    portal: 'Overview',
    plans: 'Plans',
    checkout: 'Checkout',
    success: 'Success',
    cancel: 'Cancelled',
    subscriptions: 'Subscriptions',
    upgrade: 'Upgrade',
    invoices: 'Invoices',
    transactions: 'Transactions',
    'payment-methods': 'Payment Methods',
    settings: 'Settings',
    admin: 'Admin',
    refunds: 'Refunds',
    webhooks: 'Webhooks',
    analytics: 'Analytics',
    reports: 'Reports',
    revenue: 'Revenue',
    tax: 'Tax',
    'platform-settings': 'Platform Settings',
};

export const BillingBreadcrumb = () => {
    const { pathname } = useLocation();
    const parts = pathname.split('/').filter(Boolean);

    if (!parts.includes('billing')) {
        return null;
    }

    const crumbs = [];
    let acc = '';
    parts.forEach((part, idx) => {
        acc += `/${part}`;
        const isLast = idx === parts.length - 1;
        const label = SEGMENT_LABELS[part] || (part.length > 20 ? `${part.slice(0, 8)}…` : part);
        crumbs.push({
            path: acc,
            label,
            isLast,
        });
    });

    return (
        <nav className="billing-breadcrumb" aria-label="Billing breadcrumb">
            <Link to={BILLING_ROUTES.PORTAL} className="billing-breadcrumb-home">
                <FiHome size={14} />
            </Link>
            {crumbs.map((crumb) => (
                <span key={crumb.path} className="billing-breadcrumb-segment">
                    <FiChevronRight size={12} className="billing-breadcrumb-chevron" />
                    {crumb.isLast ? (
                        <span className="billing-breadcrumb-current">{crumb.label}</span>
                    ) : (
                        <Link to={crumb.path}>{crumb.label}</Link>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default BillingBreadcrumb;
