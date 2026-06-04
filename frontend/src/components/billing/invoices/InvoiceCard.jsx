import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiDownload, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';
import './invoices.css';

export const InvoiceCard = ({ invoice, onRefresh }) => {
    const navigate = useNavigate();
    const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
    const displayStatus = isOverdue ? 'overdue' : invoice.status;

    const handleView = () => navigate(`/billing/invoices/${invoice.id}`);

    return (
        <div className="invoice-card-item" onClick={handleView}>
            <div className="invoice-card-header">
                <div className="invoice-card-number">{invoice.invoice_number}</div>
                <StatusBadge type="invoice" status={displayStatus} size="sm" />
            </div>
            <div className="invoice-card-body">
                <div className="invoice-card-date"><FiCalendar /> {new Date(invoice.invoice_date).toLocaleDateString()}</div>
                <div className="invoice-card-amount"><FiDollarSign /> <CurrencyFormatter amount={invoice.total_amount} currency={invoice.currency} /></div>
                <div className="invoice-card-due">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
            </div>
            <div className="invoice-card-actions" onClick={(e) => e.stopPropagation()}>
                <button className="invoice-card-action" onClick={handleView}><FiEye /></button>
                <InvoiceDownloadButton invoiceId={invoice.id} />
                {(invoice.status === 'pending' || isOverdue) && <InvoicePaymentButton invoiceId={invoice.id} amount={invoice.total_amount} currency={invoice.currency} onSuccess={onRefresh} />}
            </div>
        </div>
    );
};

export default InvoiceCard;