import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from '../shared/BillingIcons';

const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: renderBillingIcon('overview') },
    { id: 'subscription', label: 'Subscription', icon: renderBillingIcon('subscriptions') },
    { id: 'payment_methods', label: 'Payment Methods', icon: renderBillingIcon('paymentMethods') },
    { id: 'invoices', label: 'Invoices', icon: renderBillingIcon('invoices') },
    { id: 'settings', label: 'Settings', icon: renderBillingIcon('settings') },
];

export const BillingSidebar = ({ activeTab, onTabChange }) => {
    return (
        <div className="billing-sidebar">
            <div className="billing-sidebar-header">
                <h3 className="billing-sidebar-title">Billing Portal</h3>
            </div>
            <nav className="billing-sidebar-nav">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`billing-sidebar-item ${activeTab === item.id ? 'billing-sidebar-item-active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="billing-sidebar-icon">{item.icon}</span>
                        <span className="billing-sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

BillingSidebar.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};

export default BillingSidebar;