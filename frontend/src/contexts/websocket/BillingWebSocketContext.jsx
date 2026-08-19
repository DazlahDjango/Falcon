import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBillingWebSocket } from '../../hooks/billing';

const BillingWebSocketContext = createContext(null);

export const useBillingWebSocketContext = () => useContext(BillingWebSocketContext);

export const BillingWebSocketProvider = ({ children }) => {
    const [lastEvent, setLastEvent] = useState(null);
    const [eventHistory, setEventHistory] = useState([]);

    const {
        isConnected,
        isConnecting,
        lastMessage,
        sendMessage,
    } = useBillingWebSocket({
        autoConnect: true,
    });

    useEffect(() => {
        if (!lastMessage) return;
        const { type, data, timestamp } = lastMessage;
        const evt = { type, data, timestamp: new Date(timestamp || Date.now()) };
        setLastEvent(evt);
        setEventHistory(prev => [evt, ...prev].slice(0, 50));
    }, [lastMessage]);

    return (
        <BillingWebSocketContext.Provider value={{
            isConnected,
            isConnecting,
            lastEvent,
            eventHistory,
            sendMessage,
        }}>
            {children}
        </BillingWebSocketContext.Provider>
    );
};

export default BillingWebSocketProvider;
