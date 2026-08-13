import React, { createContext, useContext } from 'react';
import { useDashboard } from '../../hooks/dashboard/useDashboard';

const DashboardWebSocketContext = createContext(null);

export const useDashboardWebSocketContext = () => useContext(DashboardWebSocketContext);

export const DashboardWebSocketProvider = ({ children, dashboardType = 'staff' }) => {
    const { data, loading, error, refresh } = useDashboard(dashboardType, { enableWebSocket: true });

    return (
        <DashboardWebSocketContext.Provider value={{
            data,
            loading,
            error,
            refresh
        }}>
            {children}
        </DashboardWebSocketContext.Provider>
    );
};

export default DashboardWebSocketProvider;
