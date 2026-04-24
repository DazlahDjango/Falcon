import { useState, useEffect, useRef, useCallback } from 'react';
import { useOrganisation } from './useOrganisation';
import toast from 'react-hot-toast';

export const useWebSocket = (eventTypes = []) => {
  const { organisation } = useOrganisation();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!organisation) return;

    const wsUrl = `ws://localhost:8000/ws/organisations/${organisation.id}/updates/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        setMessages(prev => [...prev.slice(-99), data]);
        
        // Show toast for important events
        if (eventTypes.length === 0 || eventTypes.includes(data.type)) {
          const toastConfig = {
            subscription_updated: { message: 'Subscription updated', type: 'success' },
            payment_success: { message: 'Payment successful', type: 'success' },
            payment_failed: { message: 'Payment failed', type: 'error' },
            kpi_approved: { message: 'KPI approved', type: 'success' },
            kpi_rejected: { message: 'KPI rejected', type: 'error' },
            kpi_submitted: { message: 'New KPI submitted for approval', type: 'info' },
            domain_verified: { message: 'Domain verified successfully', type: 'success' },
            organisation_updated: { message: 'Organisation updated', type: 'info' },
          };
          
          const config = toastConfig[data.type];
          if (config) {
            if (config.type === 'success') toast.success(config.message);
            else if (config.type === 'error') toast.error(config.message);
            else toast(config.message);
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Attempt reconnect with exponential backoff
      if (reconnectAttemptsRef.current < 10) {
        const delay = Math.min(3000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, [organisation, eventTypes]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [isConnected]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    lastMessage,
    sendMessage,
    clearMessages,
    disconnect,
    reconnect: connect,
  };
};