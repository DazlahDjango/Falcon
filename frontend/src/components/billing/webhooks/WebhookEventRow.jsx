import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { WebhookRetryButton } from './WebhookRetryButton';
import { renderBillingIcon } from '../shared/BillingIcons';

export const WebhookEventRow = ({ log, onRetry }) => {
    const [expanded, setExpanded] = useState(false);

    const getEventIcon = () => {
        const icons = {
            'charge.success': renderBillingIcon('chargeSuccess', { size: 18 }),
            'charge.dispute.create': renderBillingIcon('chargeDispute', { size: 18 }),
            'subscription.create': renderBillingIcon('subscriptionCreate', { size: 18 }),
            'subscription.disable': renderBillingIcon('subscriptionDisable', { size: 18 }),
            'subscription.enable': renderBillingIcon('subscriptionEnable', { size: 18 }),
            'invoice.create': renderBillingIcon('invoiceCreate', { size: 18 }),
            'invoice.update': renderBillingIcon('invoiceUpdate', { size: 18 }),
            'invoice.payment_failed': renderBillingIcon('invoicePaymentFailed', { size: 18 }),
        };
        return icons[log.event_type] || renderBillingIcon('event', { size: 18 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString();
    };

    const canRetry = log.processing_status === 'failed' && log.retry_count < 3;

    return (
        <div className={`webhook-row ${expanded ? 'expanded' : ''}`}>
            <div className="webhook-row-main" onClick={() => setExpanded(!expanded)}>
                <div className="cell-event">
                    <span className="event-icon">{getEventIcon()}</span>
                    <span className="event-type">{log.event_type}</span>
                </div>
                <div className="cell-status">
                    <StatusBadge 
                        status={log.processing_status === 'processed' ? 'success' : log.processing_status} 
                        size="small"
                    />
                </div>
                <div className="cell-time">
                    {formatDate(log.created_at)}
                </div>
                <div className="cell-retry">
                    {log.retry_count}/3
                </div>
                <div className="cell-actions">
                    {canRetry && (
                        <WebhookRetryButton 
                            webhookId={log.id}
                            onRetry={onRetry}
                            size="small"
                        />
                    )}
                </div>
            </div>
            
            {expanded && (
                <div className="webhook-row-details">
                    <div className="detail-section">
                        <strong>Event ID:</strong>
                        <span className="mono">{log.paystack_event_id}</span>
                    </div>
                    <div className="detail-section">
                        <strong>Idempotency Key:</strong>
                        <span className="mono">{log.event_idempotency_key}</span>
                    </div>
                    {log.processing_error && (
                        <div className="detail-section error">
                            <strong>Error:</strong>
                            <span>{log.processing_error}</span>
                        </div>
                    )}
                    {log.raw_payload && (
                        <div className="detail-section">
                            <strong>Payload:</strong>
                            <pre className="payload-preview">
                                {JSON.stringify(log.raw_payload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

WebhookEventRow.propTypes = {
    log: PropTypes.shape({
        id: PropTypes.string,
        event_type: PropTypes.string,
        processing_status: PropTypes.string,
        retry_count: PropTypes.number,
        created_at: PropTypes.string,
        paystack_event_id: PropTypes.string,
        event_idempotency_key: PropTypes.string,
        processing_error: PropTypes.string,
        raw_payload: PropTypes.object,
    }).isRequired,
    onRetry: PropTypes.func.isRequired,
};

export default WebhookEventRow;