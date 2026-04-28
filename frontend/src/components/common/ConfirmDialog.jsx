import React from 'react';
import styles from './ConfirmDialog.module.css';

/**
 * ConfirmDialog - Confirmation modal dialog
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info', // info, warning, danger
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'danger': return '❗';
            default: return '❓';
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger': return styles.confirmDanger;
            case 'warning': return styles.confirmWarning;
            default: return styles.confirmInfo;
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.icon}>{getIcon()}</div>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.content}>
                    <p>{message}</p>
                </div>
                <div className={styles.footer}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`${styles.confirmButton} ${getConfirmButtonClass()}`} 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;