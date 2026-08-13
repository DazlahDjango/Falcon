import React from 'react';
import { websocketService } from '../../services/websocket';

/**
 * Global WebSocket Status Indicator component.
 * Displays live connection feedback to the user.
 */
export const GlobalWebSocketStatusIndicator = ({ connectionKey = 'accounts_notifications' }) => {
  const isConnected = websocketService.isConnected(connectionKey);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        color: '#f8fafc',
        fontSize: '12px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        pointerEvents: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#22c55e' : '#f59e0b',
          boxShadow: isConnected ? '0 0 8px #22c55e' : '0 0 8px #f59e0b',
        }}
      />
      <span>{isConnected ? 'Live Updates Active' : 'Reconnecting...'}</span>
    </div>
  );
};

export default GlobalWebSocketStatusIndicator;
