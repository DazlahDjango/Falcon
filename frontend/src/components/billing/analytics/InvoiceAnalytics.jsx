import React from 'react';
import PropTypes from 'prop-types';

export const InvoiceAnalytics = ({ data, loading }) => {
    if (loading) {
        return <div className="invoice-analytics-skeleton">Loading...</div>;
    }

    const totalInvoices = data?.total_invoices || 0;
    const paidInvoices = data?.paid || 0;
    const pendingInvoices = data?.pending || 0;
    const overdueInvoices = data?.overdue || 0;
    const totalOutstanding = data?.total_outstanding || 0;
    const averagePaymentTime = data?.avg_payment_days || 0;

    const paidPercentage = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const overduePercentage = totalInvoices > 0 ? (overdueInvoices / totalInvoices) * 100 : 0;

    return (
        <div className="invoice-analytics">
            <div className="invoice-analytics-grid">
                <div className="invoice-analytics-card">
                    <span className="invoice-analytics-label">Total Invoices</span>
                    <span className="invoice-analytics-value">{totalInvoices}</span>
                </div>
                <div className="invoice-analytics-card">
                    <span className="invoice-analytics-label">Paid</span>
                    <span className="invoice-analytics-value success">{paidInvoices}</span>
                    <span className="invoice-analytics-trend">({paidPercentage.toFixed(1)}%)</span>
                </div>
                <div className="invoice-analytics-card">
                    <span className="invoice-analytics-label">Pending</span>
                    <span className="invoice-analytics-value warning">{pendingInvoices}</span>
                </div>
                <div className="invoice-analytics-card">
                    <span className="invoice-analytics-label">Overdue</span>
                    <span className="invoice-analytics-value error">{overdueInvoices}</span>
                    <span className="invoice-analytics-trend">({overduePercentage.toFixed(1)}%)</span>
                </div>
            </div>

            <div className="invoice-analytics-progress">
                <div className="progress-label">
                    <span>Collection Rate</span>
                    <span>{paidPercentage.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${paidPercentage}%` }}></div>
                </div>
            </div>

            <div className="invoice-analytics-footer">
                <div className="analytics-footer-item">
                    <span>Outstanding Amount</span>
                    <strong>KES {(totalOutstanding / 100).toLocaleString()}</strong>
                </div>
                <div className="analytics-footer-item">
                    <span>Avg. Payment Time</span>
                    <strong>{averagePaymentTime} days</strong>
                </div>
            </div>
        </div>
    );
};

InvoiceAnalytics.propTypes = {
    data: PropTypes.shape({
        total_invoices: PropTypes.number,
        paid: PropTypes.number,
        pending: PropTypes.number,
        overdue: PropTypes.number,
        total_outstanding: PropTypes.number,
        avg_payment_days: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

export default InvoiceAnalytics;