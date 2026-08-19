import React, { createContext, useContext } from 'react';
import { useReportWebSocket } from '../../hooks/reports/useReportWebSocket';

const ReportsWebSocketContext = createContext(null);

export const useReportsWebSocketContext = () => useContext(ReportsWebSocketContext);

export const ReportsWebSocketProvider = ({ children, channel = 'notifications', reportId, dashboardId }) => {
    const { isConnected, lastMessage, send } = useReportWebSocket(channel, { reportId, dashboardId });

    return (
        <ReportsWebSocketContext.Provider value={{
            isConnected,
            lastMessage,
            send
        }}>
            {children}
        </ReportsWebSocketContext.Provider>
    );
};

export default ReportsWebSocketProvider;
