import React from 'react';
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

export const InvoiceAnalytics = ({ data = {}, loading = false }) => {
    const stats = [
        { label: 'Total Invoices', value: data.totalInvoices || 0, icon: FiFileText, color: '#3b82f6' },
        { label: 'Paid', value: data.paidInvoices || 0, icon: FiCheckCircle, color: '#22c55e' },
        { label: 'Pending', value: data.pendingInvoices || 0, icon: FiClock, color: '#f59e0b' },
        { label: 'Overdue', value: data.overdueInvoices || 0, icon: FiAlertCircle, color: '#dc2626' },
        { label: 'Total Amount', value: data.totalAmount || 0, icon: FiDollarSign, color: '#8b5cf6', isCurrency: true },
        { label: 'Outstanding', value: data.outstandingAmount || 0, icon: FiAlertCircle, color: '#ef4444', isCurrency: true }
    ];

    if (loading) return <div className="invoice-analytics-skeleton"><div className="skeleton skeleton-card"></div><div className="skeleton skeleton-card"></div><div className="skeleton skeleton-card"></div></div>;

    return (
        <div className="invoice-analytics">
            <div className="analytics-header"><h4>Invoice Analytics</h4><span className="analytics-period">Last 30 days</span></div>
            <div className="analytics-grid">
                {stats.map(stat => (
                    <div key={stat.label} className="analytics-card">
                        <div className="analytics-card-icon" style={{ background: `${stat.color}15`, color: stat.color }}><stat.icon /></div>
                        <div className="analytics-card-info"><span className="analytics-card-value">{stat.isCurrency ? <CurrencyFormatter amount={stat.value} showCents={false} /> : stat.value}</span><span className="analytics-card-label">{stat.label}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvoiceAnalytics;