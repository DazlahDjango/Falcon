// frontend/src/components/tenant/billing/TenantInvoices.jsx
import React from 'react';
import './billing.css';

export const TenantInvoices = ({ invoices, loading = false }) => {
    if (loading) {
        return (
            <div className="tenant-invoices-table-container">
                <div className="text-center p-8 text-gray-500">Loading invoices...</div>
            </div>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <div className="tenant-invoices-table-container">
                <div className="text-center p-8 text-gray-500">No invoices found</div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'failed': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="tenant-subscription-card">
            <div className="tenant-subscription-card-header">
                <h3 className="font-semibold">Billing History</h3>
            </div>
            <div className="tenant-invoices-table-container">
                <table className="tenant-invoices-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>#{invoice.number || invoice.id}</td>
                                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                <td>${invoice.amount}</td>
                                <td className={getStatusColor(invoice.status)}>{invoice.status}</td>
                                <td>
                                    <button className="text-blue-600 hover:text-blue-800">
                                        Download PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};