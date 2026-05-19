import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BillingSidebar } from './BillingSidebar';
import { BillingOverview } from './BillingOverview';
import { BillingSettings } from './BillingSettings';
import { BillingHistoryTab } from './BillingHistoryTab';
import { PaymentMethodsList } from '../payment-methods/PaymentMethodsList';
import { useBillingPortal } from '../../../hooks/billing';

const TABS = {
    OVERVIEW: 'overview',
    SUBSCRIPTION: 'subscription',
    PAYMENT_METHODS: 'payment_methods',
    INVOICES: 'invoices',
    SETTINGS: 'settings',
};

export const BillingPortal = ({ className = '' }) => {
    const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
    const { refresh } = useBillingPortal();

    const renderContent = () => {
        switch (activeTab) {
            case TABS.OVERVIEW:
                return <BillingOverview onRefresh={refresh} />;
            case TABS.PAYMENT_METHODS:
                return <PaymentMethodsList />;
            case TABS.INVOICES:
                return <BillingHistoryTab />;
            case TABS.SETTINGS:
                return <BillingSettings />;
            default:
                return <BillingOverview onRefresh={refresh} />;
        }
    };

    return (
        <div className={`billing-portal ${className}`}>
            <BillingSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="billing-portal-content">
                {renderContent()}
            </div>
        </div>
    );
};

BillingPortal.propTypes = {
    className: PropTypes.string,
};

export default BillingPortal;