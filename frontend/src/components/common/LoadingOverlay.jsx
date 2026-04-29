import React from 'react';
import styles from './LoadingOverlay.module.css';

/**
 * LoadingOverlay - Full page loading overlay
 */
const LoadingOverlay = ({ isLoading, message = 'Loading...' }) => {
    if (!isLoading) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.spinner} />
                <p className={styles.message}>{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;