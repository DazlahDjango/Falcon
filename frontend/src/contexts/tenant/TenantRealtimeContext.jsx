import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTenantWebSocket } from '../../hooks/tenant/useTenantWebSocket';

const TenantRealtimeContext = createContext(null);

export const useTenantRealtimeContext = () => useContext(TenantRealtimeContext);

export const TenantRealtimeProvider = ({ children }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const tenantId = user?.tenant_id;
    const [quotaBanner, setQuotaBanner] = useState(null);
    const [lastUsage, setLastUsage] = useState(null);
    const onQuotaRef = useRef(null);

    const onQuotaWarning = useCallback((data) => {
        setQuotaBanner({
            resource_type: data.resource_type,
            current_value: data.current_value,
            limit_value: data.limit_value,
            percentage: data.percentage,
            at: Date.now(),
        });
    }, []);

    const onStatusChange = useCallback((data) => {
        if (data?.event === 'resource_usage_updated' || data?.usage) {
            setLastUsage(data.usage || data);
        }
    }, []);

    const {
        connect,
        disconnect,
        isConnected,
        quotaWarnings,
    } = useTenantWebSocket(tenantId, {
        onQuotaWarning,
        onStatusChange,
    });

    useEffect(() => {
        if (isAuthenticated && tenantId) {
            connect();
            return () => disconnect();
        }
        return undefined;
    }, [isAuthenticated, tenantId, connect, disconnect]);

    useEffect(() => {
        if (quotaWarnings?.[0] && !quotaBanner) {
            onQuotaWarning(quotaWarnings[0]);
        }
    }, [quotaWarnings, quotaBanner, onQuotaWarning]);

    const dismissQuotaBanner = useCallback(() => setQuotaBanner(null), []);

    return (
        <TenantRealtimeContext.Provider
            value={{
                isConnected,
                quotaBanner,
                dismissQuotaBanner,
                lastUsage,
            }}
        >
            {children}
        </TenantRealtimeContext.Provider>
    );
};
