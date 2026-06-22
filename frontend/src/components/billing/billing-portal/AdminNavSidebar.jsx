import React from 'react';
import { NavLink } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRouteConstants';
import renderBillingIcon from '../shared/BillingIcons';

const ADMIN_NAV_ITEMS = [
    { path: BILLING_ROUTES.ADMIN_BASE, label: 'Dashboard', icon: renderBillingIcon('overview') },
    { path: BILLING_ROUTES.ADMIN_PLANS, label: 'Plans', icon: renderBillingIcon('plan') },
    { path: BILLING_ROUTES.ADMIN_SUBSCRIPTIONS, label: 'Subscriptions', icon: renderBillingIcon('subscriptions') },
    { path: BILLING_ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions', icon: renderBillingIcon('transactions') },
    { path: BILLING_ROUTES.ADMIN_REFUNDS, label: 'Refunds', icon: renderBillingIcon('refund') },
    { path: BILLING_ROUTES.ADMIN_WEBHOOKS, label: 'Webhooks', icon: renderBillingIcon('webhooks') },
    { path: BILLING_ROUTES.ADMIN_ANALYTICS, label: 'Analytics', icon: renderBillingIcon('analytics') },
    { path: BILLING_ROUTES.REPORTS_REVENUE, label: 'Revenue Report', icon: renderBillingIcon('reports') },
    { path: BILLING_ROUTES.PLATFORM_SETTINGS, label: 'Platform Settings', icon: renderBillingIcon('settings') },
];

export const AdminNavSidebar = () => {
    return (
        <div className="admin-nav-sidebar">
            <div className="admin-nav-header">
                <h3>Billing Admin</h3>
            </div>
            <nav className="admin-nav-menu">
                {ADMIN_NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `admin-nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === BILLING_ROUTES.ADMIN_BASE}
                    >
                        <span className="admin-nav-icon">{item.icon}</span>
                        <span className="admin-nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default AdminNavSidebar;