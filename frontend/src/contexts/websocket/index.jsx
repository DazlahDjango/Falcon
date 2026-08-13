import React from 'react';
import { useSelector } from 'react-redux';
import { AccountsWebSocketProvider, useAccountsWebSocketContext } from './AccountsWebSocketContext';
import { TenantWebSocketProvider, useTenantWebSocketContext } from './TenantWebSocketContext';
import { BillingWebSocketProvider, useBillingWebSocketContext } from './BillingWebSocketContext';
import { ConfigWebSocketProvider, useConfigWebSocketContext } from './ConfigWebSocketContext';
import { DashboardWebSocketProvider, useDashboardWebSocketContext } from './DashboardWebSocketContext';
import { KPIWebSocketProvider, useKPIWebSocketContext } from './KPIWebSocketContext';
import { ReportsWebSocketProvider, useReportsWebSocketContext } from './ReportsWebSocketContext';
import { ReviewsWebSocketProvider, useReviewsWebSocketContext } from './ReviewsWebSocketContext';

export {
    useAccountsWebSocketContext,
    useTenantWebSocketContext,
    useBillingWebSocketContext,
    useConfigWebSocketContext,
    useDashboardWebSocketContext,
    useKPIWebSocketContext,
    useReportsWebSocketContext,
    useReviewsWebSocketContext,
};

/**
 * Root WebSocketProvider that wraps all domain WebSocket contexts into a single, clean provider tree.
 * Only activates when the user is authenticated.
 */
export const WebSocketProvider = ({ children }) => {
    const authState = useSelector((state) => state.auth || {});
    const isAuthenticated = !!authState.isAuthenticated;
    const tenantId = authState.user?.tenant_id;

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <AccountsWebSocketProvider isAuthenticated={isAuthenticated}>
            <TenantWebSocketProvider tenantId={tenantId} isAuthenticated={isAuthenticated}>
                <BillingWebSocketProvider>
                    <ConfigWebSocketProvider>
                        <KPIWebSocketProvider>
                            {children}
                        </KPIWebSocketProvider>
                    </ConfigWebSocketProvider>
                </BillingWebSocketProvider>
            </TenantWebSocketProvider>
        </AccountsWebSocketProvider>
    );
};

export default WebSocketProvider;
