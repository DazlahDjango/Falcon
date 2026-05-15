import React, { useState } from 'react';
import { InvoicesList } from '../invoices/InvoicesList';
import { TransactionsList } from '../transactions/TransactionsList';

export const BillingHistoryTab = () => {
    const [activeView, setActiveView] = useState('invoices'); // 'invoices' or 'transactions'

    return (
        <div className="billing-history">
            <div className="billing-history-header">
                <h3 className="billing-history-title">Billing History</h3>
                <div className="billing-history-tabs">
                    <button
                        className={`billing-history-tab ${activeView === 'invoices' ? 'active' : ''}`}
                        onClick={() => setActiveView('invoices')}
                    >
                        Invoices
                    </button>
                    <button
                        className={`billing-history-tab ${activeView === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveView('transactions')}
                    >
                        Transactions
                    </button>
                </div>
            </div>

            {activeView === 'invoices' ? (
                <InvoicesList />
            ) : (
                <TransactionsList />
            )}
        </div>
    );
};

export default BillingHistoryTab;