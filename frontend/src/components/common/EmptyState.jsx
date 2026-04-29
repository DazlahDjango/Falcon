import React from 'react';
import styles from './EmptyState.module.css';

/**
 * EmptyState - Empty state component for no data
 */
const EmptyState = ({ 
    icon = '📊', 
    title = 'No Data Available', 
    message = 'There is no data to display at the moment.',
    actionText,
    onAction,
    className = '',
}) => {
    return (
        <div className={`${styles.emptyState} ${className}`}>
            <div className={styles.icon}>{icon}</div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
            {actionText && onAction && (
                <button className={styles.actionButton} onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;