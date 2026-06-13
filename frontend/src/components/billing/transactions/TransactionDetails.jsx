import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiCheck, FiRefreshCw, FiAlertCircle, FiDollarSign, FiCalendar, FiCreditCard, FiUser, FiMail } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useTransaction } from '../../../hooks/billing/useTransaction';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import './transactions.css';

export const TransactionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { transaction, loading, error, fetchById, verify, refund, clear } = useTransaction(id, { autoFetch: true });
    const [copied, setCopied] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [refunding, setRefunding] = useState(false);

    useEffect(() => { if (id) fetchById(id); return () => clear(); }, [id, fetchById, clear]);

    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const handleVerify = async () => { setVerifying(true); await verify(transaction?.reference); await fetchById(id); setVerifying(false); };
    const handleRefund = async () => { if (window.confirm('Are you sure you want to refund this transaction?')) { setRefunding(true); await refund(id); await fetchById(id); setRefunding(false); } };

    if (loading) return <LoadingSkeleton type="invoice" count={1} />;
    if (error || !transaction) return <EmptyState type="default" title="Transaction Not Found" message="The transaction you're looking for doesn't exist or you don't have permission to view it." />;

    const canRefund = transaction.status === 'success' && permissions.canRefundTransactions;
    const canVerify = transaction.status === 'pending' && permissions.canManageSubscriptions;

    return (
        <BillingShell title="Transaction Details" subtitle={`Reference: ${transaction.reference}`} breadcrumb={true}>
            <div className="transaction-detail-container">
                <div className="transaction-detail-actions">
                    <button className="transaction-back-btn" onClick={() => navigate('/billing/transactions')}><FiArrowLeft /> Back to Transactions</button>
                    <div className="transaction-action-group">
                        {canVerify && <button className="transaction-action-btn verify" onClick={handleVerify} disabled={verifying}><FiRefreshCw className={verifying ? 'spin' : ''} /> {verifying ? 'Verifying...' : 'Verify Payment'}</button>}
                        {canRefund && <button className="transaction-action-btn refund" onClick={handleRefund} disabled={refunding}><FiRefreshCw className={refunding ? 'spin' : ''} /> {refunding ? 'Refunding...' : 'Refund Transaction'}</button>}
                    </div>
                </div>

                <div className="transaction-detail-card">
                    <div className="transaction-header">
                        <div className="transaction-status"><StatusBadge type="transaction" status={transaction.status} size="lg" /></div>
                        <div className="transaction-reference">
                            <span className="label">Reference</span>
                            <span className="value">{transaction.reference}</span>
                            <button className="copy-btn" onClick={() => copyToClipboard(transaction.reference)}>{copied ? <FiCheck /> : <FiCopy />}</button>
                        </div>
                    </div>

                    <div className="transaction-info-grid">
                        <div className="info-section"><h4>Payment Details</h4><div className="info-row"><span className="label">Amount</span><span className="value"><CurrencyFormatter amount={transaction.total_amount} currency={transaction.currency} /></span></div><div className="info-row"><span className="label">Subtotal</span><span className="value"><CurrencyFormatter amount={transaction.amount} currency={transaction.currency} /></span></div><div className="info-row"><span className="label">Tax</span><span className="value"><CurrencyFormatter amount={transaction.tax_amount} currency={transaction.currency} /></span></div><div className="info-row"><span className="label">Payment Method</span><span className="value capitalize">{transaction.payment_method || 'N/A'}</span></div></div>
                        <div className="info-section"><h4>Timing</h4><div className="info-row"><span className="label">Created At</span><span className="value">{new Date(transaction.created_at).toLocaleString()}</span></div><div className="info-row"><span className="label">Payment Date</span><span className="value">{transaction.payment_date ? new Date(transaction.payment_date).toLocaleString() : 'Pending'}</span></div></div>
                        {transaction.subscription_id && (<div className="info-section"><h4>Subscription</h4><div className="info-row"><span className="label">Subscription ID</span><span className="value monospace">{transaction.subscription_id}</span></div></div>)}
                        {transaction.invoice_id && (<div className="info-section"><h4>Invoice</h4><div className="info-row"><span className="label">Invoice ID</span><span className="value monospace">{transaction.invoice_id}</span></div></div>)}
                    </div>

                    {transaction.card_last4 && (<div className="transaction-card-info"><h4>Card Information</h4><div className="card-details"><span className="card-brand capitalize">{transaction.card_brand}</span><span className="card-number">•••• {transaction.card_last4}</span></div></div>)}

                    {transaction.error_message && (<div className="transaction-error"><FiAlertCircle /> {transaction.error_message}</div>)}

                    {transaction.paystack_response && (<div className="transaction-paystack-response"><h4>PayStack Response</h4><pre>{JSON.stringify(transaction.paystack_response, null, 2)}</pre></div>)}
                </div>
            </div>
        </BillingShell>
    );
};

export default TransactionDetails;