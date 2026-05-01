import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ActualEntryPage from './ActualEntry';
import ValidationQueue from './ValidationQueue';
import AdjustmentRequests from './AdjustmentRequests';
import styles from './PerformanceTracking.module.css';

const PerformanceTracking = ({ userId, userRole, onError }) => {
    const [activeTab, setActiveTab] = useState('entry');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const tabs = [
        { id: 'entry', label: 'Actual Entry', icon: '✏️', roles: ['super_admin', 'client_admin', 'executive', 'supervisor', 'dashboard_champion'] },
        { id: 'validation', label: 'Validation Queue', icon: '✓', roles: ['supervisor', 'super_admin', 'client_admin'] },
        { id: 'adjustments', label: 'Adjustment Requests', icon: '↻', roles: ['user', 'supervisor', 'super_admin', 'client_admin'] }
    ];
    const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    return (
        <div className={styles.performanceTracking}>
            <div className={styles.header}>
                <h2>Performance Tracking</h2>
                <p className={styles.subtitle}>
                    {activeTab === 'entry' && 'Enter your monthly performance data with supporting evidence'}
                    {activeTab === 'validation' && 'Review and validate team member submissions'}
                    {activeTab === 'adjustments' && 'Request or review adjustments to approved data'}
                </p>
            </div>

            <div className={styles.tabs}>
                {visibleTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className={styles.tabIcon}>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'entry' && (
                    <ActualEntryPage 
                        userId={userId}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onError={onError}
                    />
                )}
                {activeTab === 'validation' && (
                    <ValidationQueue 
                        userId={userId}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onError={onError}
                    />
                )}
                {activeTab === 'adjustments' && (
                    <AdjustmentRequests 
                        userId={userId}
                        userRole={userRole}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onError={onError}
                    />
                )}
            </div>
        </div>
    );
};
PerformanceTracking.propTypes = {
    userId: PropTypes.string,
    userRole: PropTypes.oneOf(['employee', 'manager', 'admin']).isRequired,
    onError: PropTypes.func,
};
export default PerformanceTracking;