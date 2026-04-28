import React, { useEffect } from 'react';
import styles from './NotificationToast.module.css';

/**
 * NotificationToast - Individual toast notification
 */
const NotificationToast = ({ id, type, title, message, duration = 5000, onClose }) => {
    useEffect(() => {
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
            <div className={styles.toastIcon}>{getIcon()}</div>
            <div className={styles.toastContent}>
                {title && <div className={styles.toastTitle}>{title}</div>}
                <div className={styles.toastMessage}>{message}</div>
            </div>
            <button className={styles.toastClose} onClick={() => onClose(id)}>×</button>
        </div>
    );
};

export default NotificationToast;