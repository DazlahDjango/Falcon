import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ConfigAlertContext = createContext(null);

const initialState = {
  alerts: [],
  unreadCount: 0
};

function alertReducer(state, action) {
  switch (action.type) {
    case 'ADD_ALERT':
      const newAlert = { ...action.payload, id: Date.now(), read: false, timestamp: new Date().toISOString() };
      return {
        ...state,
        alerts: [newAlert, ...state.alerts],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert => alert.id === action.payload ? { ...alert, read: true } : alert),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert => ({ ...alert, read: true })),
        unreadCount: 0
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
        unreadCount: state.alerts.filter(a => a.id !== action.payload && !a.read).length
      };
    case 'CLEAR_ALL':
      return { alerts: [], unreadCount: 0 };
    default:
      return state;
  }
}

export const ConfigAlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  const addAlert = useCallback((type, title, message, link = null) => {
    const alert = { type, title, message, link };
    dispatch({ type: 'ADD_ALERT', payload: alert });
  }, []);

  const addSuccess = useCallback((title, message, link = null) => {
    addAlert('success', title, message, link);
  }, [addAlert]);

  const addError = useCallback((title, message, link = null) => {
    addAlert('error', title, message, link);
  }, [addAlert]);

  const addWarning = useCallback((title, message, link = null) => {
    addAlert('warning', title, message, link);
  }, [addAlert]);

  const addInfo = useCallback((title, message, link = null) => {
    addAlert('info', title, message, link);
  }, [addAlert]);

  const markRead = useCallback((alertId) => {
    dispatch({ type: 'MARK_READ', payload: alertId });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const removeAlert = useCallback((alertId) => {
    dispatch({ type: 'REMOVE_ALERT', payload: alertId });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value = {
    alerts: state.alerts,
    unreadCount: state.unreadCount,
    addAlert,
    addSuccess,
    addError,
    addWarning,
    addInfo,
    markRead,
    markAllRead,
    removeAlert,
    clearAll
  };

  return <ConfigAlertContext.Provider value={value}>{children}</ConfigAlertContext.Provider>;
};

export const useConfigAlertContext = () => {
  const context = useContext(ConfigAlertContext);
  if (!context) {
    throw new Error('useConfigAlertContext must be used within ConfigAlertProvider');
  }
  return context;
};