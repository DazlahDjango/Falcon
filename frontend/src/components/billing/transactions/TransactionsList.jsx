import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TransactionRow } from './TransactionRow';
import { TransactionFilter } from './TransactionFilter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useTransactions } from '../../../hooks/billing';

export const TransactionsList = ({ 
    limit = null,
    showFilter = true,
    onTransactionClick,
    className = '' 
}) => {
    const {
        transactions,
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
        verifyTransaction,
    } = useTransactions();

    const [verifyingId, setVerifyingId] = useState(null);

    const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

    const handleVerify = async (reference) => {
        setVerifyingId(reference);
        try {
            await verifyTransaction(reference);
        } finally {
            setVerifyingId(null);
        }
    };

    if (loading && transactions.length === 0) {
        return <LoadingSkeleton type="list" count={limit || 10} />;
    }

    if (error) {
        return (
            <EmptyState 
                title="Unable to load transactions"
                message={error}
                icon="⚠️"
            />
        );
    }

    if (transactions.length === 0) {
        return (
            <EmptyState 
                title="No transactions found"
                message="Your transaction history will appear here"
                icon="💳"
            />
        );
    }

    return (
        <div className={`transactions-container ${className}`}>
            {summary && (
                <div className="transactions-summary">
                    <div className="transactions-summary-card">
                        <span className="transactions-summary-label">Total Spent</span>
                        <span className="transactions-summary-value">
                            KES {((summary.total_spent || 0) / 100).toLocaleString()}
                        </span>
                    </div>
                    <div className="transactions-summary-card">
                        <span className="transactions-summary-label">Successful</span>
                        <span className="transactions-summary-value success">
                            {summary.successful || 0}
                        </span>
                    </div>
                    <div className="transactions-summary-card">
                        <span className="transactions-summary-label">Failed</span>
                        <span className="transactions-summary-value failed">
                            {summary.failed || 0}
                        </span>
                    </div>
                    <div className="transactions-summary-card">
                        <span className="transactions-summary-label">Pending</span>
                        <span className="transactions-summary-value pending">
                            {summary.pending || 0}
                        </span>
                    </div>
                </div>
            )}

            {showFilter && (
                <TransactionFilter 
                    filters={filters}
                    onFilterChange={updateFilters}
                    onClear={clearFilters}
                />
            )}

            <div className="transactions-list">
                <div className="transactions-list-header">
                    <div className="transaction-header-reference">Reference</div>
                    <div className="transaction-header-type">Type</div>
                    <div className="transaction-header-date">Date</div>
                    <div className="transaction-header-amount">Amount</div>
                    <div className="transaction-header-status">Status</div>
                    <div className="transaction-header-actions">Actions</div>
                </div>
                {displayedTransactions.map((transaction) => (
                    <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onClick={() => onTransactionClick?.(transaction.id)}
                        onVerify={() => handleVerify(transaction.reference)}
                        verifying={verifyingId === transaction.reference}
                    />
                ))}
            </div>

            {!limit && totalPages > 1 && (
                <div className="transactions-pagination">
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

TransactionsList.propTypes = {
    limit: PropTypes.number,
    showFilter: PropTypes.bool,
    onTransactionClick: PropTypes.func,
    className: PropTypes.string,
};

export default TransactionsList;