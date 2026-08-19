import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { configWebSocketService } from '../../services/config/websocket.service';

const ConfigWebSocketContext = createContext(null);

export const useConfigWebSocketContext = () => useContext(ConfigWebSocketContext);

export const ConfigWebSocketProvider = ({ children }) => {
    const [connections, setConnections] = useState({ maintenance: false, backup: false, dr: false });
    const [lastMessages, setLastMessages] = useState({});
    const listenersRef = useRef(new Map());

    const connectMaintenance = useCallback(async (tenantId, onMessage) => {
        const id = `maintenance_${tenantId || 'system'}`;
        configWebSocketService.connectMaintenance(tenantId, (data) => {
            setLastMessages(prev => ({ ...prev, [id]: data }));
            if (onMessage) onMessage(data);
        });
        setConnections(prev => ({ ...prev, maintenance: true }));
        return id;
    }, []);

    const connectBackup = useCallback(async (backupJobId, onMessage) => {
        const id = `backup_${backupJobId}`;
        configWebSocketService.connectBackupProgress(backupJobId, (data) => {
            setLastMessages(prev => ({ ...prev, [id]: data }));
            if (onMessage) onMessage(data);
        });
        setConnections(prev => ({ ...prev, backup: true }));
        return id;
    }, []);

    const connectDR = useCallback(async (executionId, onMessage) => {
        const id = `dr_${executionId}`;
        configWebSocketService.connectDRProgress(executionId, (data) => {
            setLastMessages(prev => ({ ...prev, [id]: data }));
            if (onMessage) onMessage(data);
        });
        setConnections(prev => ({ ...prev, dr: true }));
        return id;
    }, []);

    const disconnect = useCallback((id) => {
        configWebSocketService.disconnect(id);
        setLastMessages(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    }, []);

    return (
        <ConfigWebSocketContext.Provider value={{
            connections,
            lastMessages,
            connectMaintenance,
            connectBackup,
            connectDR,
            disconnect,
        }}>
            {children}
        </ConfigWebSocketContext.Provider>
    );
};

export default ConfigWebSocketProvider;
