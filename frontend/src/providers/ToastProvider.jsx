import React, { createContext, useContext, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './ToastProvider.module.css';

const ToastContext = createContext(null);
const ToastItem = ({ id, message, type, duration, onClose }) => {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <span className={styles.toastIcon}>{getIcon()}</span>
            <span className={styles.toastMessage}>{message}</span>
            <button className={styles.toastClose} onClick={() => onClose(id)}>×</button>
        </div>
    );
};

/**
 * ToastContainer Component
 */
const ToastContainer = ({ toasts, onClose }) => {
    return createPortal(
        <div className={styles.container}>
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    {...toast}
                    onClose={onClose}
                />
            ))}
        </div>,
        document.body
    );
};

/**
 * ToastProvider - Provides toast notification functionality
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = React.useState([]);
    const nextId = useRef(0);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = nextId.current++;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    const value = {
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
};

/**
 * useToast - Hook to access toast context
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export default ToastProvider;