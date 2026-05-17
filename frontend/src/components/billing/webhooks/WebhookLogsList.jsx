import React from 'react';
import PropTypes from 'prop-types';
import { WebhookEventRow } from './WebhookEventRow';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { renderBillingIcon } from '../shared/BillingIcons';

export const WebhookLogsList = ({ logs, loading, onRetry }) => {
    if (loading) {
        return <LoadingSkeleton type="list" count={10} />;
    }

    if (logs.length === 0) {
        return (
            <EmptyState 
                title="No webhook events"
                message="Webhook events will appear here when received"
                icon={renderBillingIcon('webhooks', { size: 40 })}
            />
        );
    }

    return (
        <div className="webhook-logs-list">
            <div className="logs-header">
                <div className="header-event">Event</div>
                <div className="header-status">Status</div>
                <div className="header-time">Time</div>
                <div className="header-retry">Retries</div>
                <div className="header-actions">Actions</div>
            </div>
            <div className="logs-body">
                {logs.map((log) => (
                    <WebhookEventRow 
                        key={log.id} 
                        log={log} 
                        onRetry={onRetry}
                    />
                ))}
            </div>
        </div>
    );
};

WebhookLogsList.propTypes = {
    logs: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onRetry: PropTypes.func.isRequired,
};

export default WebhookLogsList;