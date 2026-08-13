import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTenantWebSocket } from '../../hooks/tenant/useTenantWebSocket';

const TenantWebSocketContext = createContext(null);

export const useTenantWebSocketContext = () => useContext(TenantWebSocketContext);

export const TenantWebSocketProvider = ({ children, tenantId, isAuthenticated }) => {
    const [quotaBanner, setQuotaBanner] = useState(null);
    const [lastUsage, setLastUsage] = useState(null);

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
    }, [isAuthenticated, tenantId, connect, disconnect]);

    const dismissQuotaBanner = useCallback(() => setQuotaBanner(null), []);

    return (
        <TenantWebSocketContext.Provider value={{
            isConnected,
            quotaBanner,
            dismissQuotaBanner,
            lastUsage,
        }}>
            {children}
        </TenantWebSocketContext.Provider>
    );
};

export default TenantWebSocketProvider;
