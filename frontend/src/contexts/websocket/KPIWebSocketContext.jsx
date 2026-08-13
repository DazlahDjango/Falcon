import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useKPIWebSocket } from '../../hooks/kpi/useKPIWebSocket';

const KPIWebSocketContext = createContext(null);

export const useKPIWebSocketContext = () => useContext(KPIWebSocketContext);

export const KPIWebSocketProvider = ({ children }) => {
    const { user } = useSelector((state) => state.auth || {});
    const userId = user?.id;

    const { connect, disconnect } = useKPIWebSocket(userId, ['dashboard', 'scores', 'notifications']);

    return (
        <KPIWebSocketContext.Provider value={{
            connect,
            disconnect
        }}>
            {children}
        </KPIWebSocketContext.Provider>
    );
};

export default KPIWebSocketProvider;
