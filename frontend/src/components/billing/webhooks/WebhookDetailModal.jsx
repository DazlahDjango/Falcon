import React, { useState } from 'react';
import { FiX, FiCopy, FiCheck, FiRotateCcw, FiAlertCircle } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './webhooks.css';

export const WebhookDetailModal = ({ webhook, onClose, onRetry }) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatJSON = (data) => {
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    const getEventTypeLabel = (eventType) => {
        const labels = {
            'charge.success': 'Charge Success',
            'subscription.create': 'Subscription Created',
            'subscription.disable': 'Subscription Disabled',
            'subscription.enable': 'Subscription Enabled',
            'invoice.create': 'Invoice Created',
            'invoice.update': 'Invoice Updated',
            'invoice.payment_failed': 'Payment Failed'
        };
        return labels[eventType] || eventType;
    };

    const getStatusColor = (status) => {
        if (status === 'processed') return 'success';
        if (status === 'failed') return 'error';
        if (status === 'pending') return 'warning';
        return 'secondary';
    };

    return (
        <div className="webhook-modal-overlay">
            <div className="webhook-modal">
                <div className="webhook-modal-header">
                    <div className="webhook-modal-title">
                        <h3>Webhook Event Details</h3>
                        <p>{getEventTypeLabel(webhook.event_type)}</p>
                    </div>
                    <button className="webhook-modal-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="webhook-modal-tabs">
                    <button className={`webhook-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
                    <button className={`webhook-tab ${activeTab === 'payload' ? 'active' : ''}`} onClick={() => setActiveTab('payload')}>Payload</button>
                    <button className={`webhook-tab ${activeTab === 'response' ? 'active' : ''}`} onClick={() => setActiveTab('response')}>Response</button>
                </div>

                <div className="webhook-modal-body">
                    {activeTab === 'details' && (
                        <div className="webhook-details">
                            <div className="detail-section">
                                <h4>Event Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item"><span className="detail-label">Event ID:</span><span className="detail-value">{webhook.paystack_event_id}</span><button className="copy-btn" onClick={() => copyToClipboard(webhook.paystack_event_id)}>{copied ? <FiCheck /> : <FiCopy />}</button></div>
                                    <div className="detail-item"><span className="detail-label">Event Type:</span><span className="detail-value"><StatusBadge type="transaction" status={webhook.event_type.includes('success') ? 'success' : webhook.event_type.includes('failed') ? 'failed' : 'info'} size="sm" /> {webhook.event_type}</span></div>
                                    <div className="detail-item"><span className="detail-label">Processing Status:</span><span className="detail-value"><StatusBadge type="transaction" status={getStatusColor(webhook.processing_status)} size="sm" /> {webhook.processing_status}</span></div>
                                    <div className="detail-item"><span className="detail-label">Received At:</span><span className="detail-value">{new Date(webhook.created_at).toLocaleString()}</span></div>
                                    <div className="detail-item"><span className="detail-label">Processed At:</span><span className="detail-value">{webhook.processed_at ? new Date(webhook.processed_at).toLocaleString() : 'Not processed'}</span></div>
                                    <div className="detail-item"><span className="detail-label">Signature Valid:</span><span className={`detail-value ${webhook.signature_valid ? 'valid' : 'invalid'}`}>{webhook.signature_valid ? 'Yes' : 'No'}</span></div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Processing Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item"><span className="detail-label">Retry Count:</span><span className="detail-value">{webhook.retry_count} / {webhook.max_retries}</span></div>
                                    <div className="detail-item"><span className="detail-label">Idempotency Key:</span><span className="detail-value mono">{webhook.event_idempotency_key?.slice(-24)}</span><button className="copy-btn" onClick={() => copyToClipboard(webhook.event_idempotency_key)}><FiCopy /></button></div>
                                    {webhook.processing_error && <div className="detail-item full-width"><span className="detail-label">Error:</span><span className="detail-value error">{webhook.processing_error}</span></div>}
                                </div>
                            </div>

                            {webhook.related_transaction && (
                                <div className="detail-section">
                                    <h4>Related Transaction</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item"><span className="detail-label">Transaction ID:</span><span className="detail-value">{webhook.related_transaction}</span></div>
                                    </div>
                                </div>
                            )}

                            {webhook.related_subscription && (
                                <div className="detail-section">
                                    <h4>Related Subscription</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item"><span className="detail-label">Subscription ID:</span><span className="detail-value">{webhook.related_subscription}</span></div>
                                    </div>
                                </div>
                            )}

                            {webhook.processing_status === 'failed' && webhook.retry_count < webhook.max_retries && (
                                <div className="detail-section retry-section">
                                    <button className="retry-webhook-btn" onClick={onRetry}><FiRotateCcw /> Retry Webhook</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'payload' && (
                        <div className="webhook-payload">
                            <div className="payload-header"><h4>Raw Payload</h4><button className="copy-btn" onClick={() => copyToClipboard(formatJSON(webhook.raw_payload))}>{copied ? <FiCheck /> : <FiCopy />}</button></div>
                            <pre className="payload-content">{formatJSON(webhook.raw_payload)}</pre>
                        </div>
                    )}

                    {activeTab === 'response' && webhook.paystack_response && (
                        <div className="webhook-response">
                            <div className="payload-header"><h4>PayStack Response</h4><button className="copy-btn" onClick={() => copyToClipboard(formatJSON(webhook.paystack_response))}>{copied ? <FiCheck /> : <FiCopy />}</button></div>
                            <pre className="payload-content">{formatJSON(webhook.paystack_response)}</pre>
                        </div>
                    )}
                </div>

                <div className="webhook-modal-footer">
                    <button className="modal-close-btn" onClick={onClose}>Close</button>
                    {webhook.processing_status === 'failed' && webhook.retry_count < webhook.max_retries && <button className="modal-retry-btn" onClick={onRetry}><FiRotateCcw /> Retry Webhook</button>}
                </div>
            </div>
        </div>
    );
};

export default WebhookDetailModal;