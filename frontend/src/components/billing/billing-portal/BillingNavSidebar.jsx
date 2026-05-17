import React from 'react';
import { NavLink } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../routes/billing.routes';
import { renderBillingIcon } from '../shared/BillingIcons';

const NAV_ITEMS = [
    { path: BILLING_ROUTES.BILLING_PORTAL, label: 'Overview', icon: renderBillingIcon('overview') },
    { path: BILLING_ROUTES.SUBSCRIPTIONS, label: 'Subscriptions', icon: renderBillingIcon('subscriptions') },
    { path: BILLING_ROUTES.INVOICES, label: 'Invoices', icon: renderBillingIcon('invoices') },
    { path: BILLING_ROUTES.TRANSACTIONS, label: 'Transactions', icon: renderBillingIcon('transactions') },
    { path: BILLING_ROUTES.PAYMENT_METHODS, label: 'Payment Methods', icon: renderBillingIcon('paymentMethods') },
    { path: BILLING_ROUTES.BILLING_SETTINGS, label: 'Settings', icon: renderBillingIcon('settings') },
];

export const BillingNavSidebar = () => {
    return (
        <div className="billing-nav-sidebar">
            <div className="billing-nav-header">
                <h3>Billing</h3>
            </div>
            <nav className="billing-nav-menu">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `billing-nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === BILLING_ROUTES.BILLING_PORTAL}
                    >
                        <span className="billing-nav-icon">{item.icon}</span>
                        <span className="billing-nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BillingNavSidebar;