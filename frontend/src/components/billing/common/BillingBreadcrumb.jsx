import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import './common.css';

const BREADCRUMB_MAP = {
    'plans': 'Plans',
    'subscriptions': 'Subscriptions',
    'invoices': 'Invoices',
    'transactions': 'Transactions',
    'payment-methods': 'Payment Methods',
    'portal': 'Billing Portal',
    'analytics': 'Analytics',
    'admin': 'Admin',
    'webhooks': 'Webhooks',
    'settings': 'Settings',
    'checkout': 'Checkout',
    'success': 'Success',
    'cancel': 'Cancelled',
    'upgrade': 'Upgrade Plan',
    'downgrade': 'Downgrade Plan',
    'cancel-subscription': 'Cancel Subscription',
    'usage': 'Usage Tracking',
    'audit': 'Audit Logs',
    'enterprise': 'Enterprise',
};

export const BillingBreadcrumb = ({ items, separator = <FiChevronRight size={14} />, className = '' }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(seg => seg && seg !== 'billing');

    const breadcrumbItems = items || pathSegments.map((segment, index) => {
        const path = `/billing/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = BREADCRUMB_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return { label, path, isLast };
    });

    return (
        <nav className={`billing-breadcrumb ${className}`} aria-label="Breadcrumb">
            <ol className="billing-breadcrumb-list">
                <li className="billing-breadcrumb-item">
                    <Link to="/dashboard" className="billing-breadcrumb-link">
                        <FiHome size={16} />
                        <span className="billing-breadcrumb-home-text">Home</span>
                    </Link>
                    {breadcrumbItems.length > 0 && <span className="billing-breadcrumb-separator">{separator}</span>}
                </li>
                {breadcrumbItems.map((item, index) => (
                    <li key={index} className="billing-breadcrumb-item">
                        {item.isLast ? (
                            <span className="billing-breadcrumb-current">{item.label}</span>
                        ) : (
                            <Link to={item.path} className="billing-breadcrumb-link">{item.label}</Link>
                        )}
                        {!item.isLast && <span className="billing-breadcrumb-separator">{separator}</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default BillingBreadcrumb;