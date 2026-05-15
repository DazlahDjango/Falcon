import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { InvoiceCard } from './InvoiceCard';
import { InvoiceFilter } from './InvoiceFilter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useInvoices } from '../../../hooks/billing';

export const InvoicesList = ({ 
    limit = null,
    showFilter = true,
    onInvoiceClick,
    className = '' 
}) => {
    const {
        invoices,
        loading,
        error,
        summary,
        totalCount,
        currentPage,
        totalPages,
        filters,
        updateFilters,
        clearFilters,
        goToPage,
        downloadInvoice,
        payInvoice,
    } = useInvoices();

    const [downloadingId, setDownloadingId] = useState(null);
    const [payingId, setPayingId] = useState(null);

    const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;

    const handleDownload = async (invoiceId) => {
        setDownloadingId(invoiceId);
        try {
            await downloadInvoice(invoiceId);
        } finally {
            setDownloadingId(null);
        }
    };

    const handlePay = async (invoiceId) => {
        setPayingId(invoiceId);
        try {
            await payInvoice(invoiceId);
        } finally {
            setPayingId(null);
        }
    };

    if (loading && invoices.length === 0) {
        return <LoadingSkeleton type="list" count={limit || 5} />;
    }

    if (error) {
        return (
            <EmptyState 
                title="Unable to load invoices"
                message={error}
                icon="⚠️"
            />
        );
    }

    if (invoices.length === 0) {
        return (
            <EmptyState 
                title="No invoices found"
                message="Your invoices will appear here once generated"
                icon="📄"
            />
        );
    }

    return (
        <div className={`invoices-container ${className}`}>
            {summary && (
                <div className="invoices-summary">
                    <div className="invoices-summary-card">
                        <span className="invoices-summary-label">Total Outstanding</span>
                        <span className="invoices-summary-value">
                            KES {((summary.total_outstanding || 0) / 100).toLocaleString()}
                        </span>
                    </div>
                    <div className="invoices-summary-card">
                        <span className="invoices-summary-label">Total Paid</span>
                        <span className="invoices-summary-value">
                            KES {((summary.total_paid_amount || 0) / 100).toLocaleString()}
                        </span>
                    </div>
                    <div className="invoices-summary-card">
                        <span className="invoices-summary-label">Total Invoices</span>
                        <span className="invoices-summary-value">{summary.total_invoices || 0}</span>
                    </div>
                    <div className="invoices-summary-card">
                        <span className="invoices-summary-label">Overdue</span>
                        <span className="invoices-summary-value overdue">
                            {summary.overdue || 0}
                        </span>
                    </div>
                </div>
            )}

            {showFilter && (
                <InvoiceFilter 
                    filters={filters}
                    onFilterChange={updateFilters}
                    onClear={clearFilters}
                />
            )}

            <div className="invoices-list">
                {displayedInvoices.map((invoice) => (
                    <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onClick={() => onInvoiceClick?.(invoice.id)}
                        onDownload={() => handleDownload(invoice.id)}
                        onPay={() => handlePay(invoice.id)}
                        downloading={downloadingId === invoice.id}
                        paying={payingId === invoice.id}
                    />
                ))}
            </div>

            {!limit && totalPages > 1 && (
                <div className="invoices-pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

InvoicesList.propTypes = {
    limit: PropTypes.number,
    showFilter: PropTypes.bool,
    onInvoiceClick: PropTypes.func,
    className: PropTypes.string,
};

export default InvoicesList;