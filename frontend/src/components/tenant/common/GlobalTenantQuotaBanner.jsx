import React from 'react';
import { useTenantRealtimeContext } from '../../../contexts/tenant/TenantRealtimeContext';

export const GlobalTenantQuotaBanner = () => {
    const ctx = useTenantRealtimeContext();
    if (!ctx?.quotaBanner) return null;

    const { resource_type, current_value, limit_value, percentage } = ctx.quotaBanner;

    return (
        <div
            className="global-banner global-banner--warning"
            role="alert"
            style={{
                padding: '0.5rem 1rem',
                background: '#fef3c7',
                borderBottom: '1px solid #f59e0b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <span>
                <strong>Quota warning:</strong>
                {' '}
                {resource_type?.replace(/_/g, ' ')}
                {' '}
                at
                {' '}
                {percentage ?? Math.round((current_value / limit_value) * 100)}
                % (
                {current_value}
                /
                {limit_value}
                ) — counts synced from live platform data.
            </span>
            <button type="button" className="text-sm underline" onClick={ctx.dismissQuotaBanner}>
                Dismiss
            </button>
        </div>
    );
};

export default GlobalTenantQuotaBanner;
