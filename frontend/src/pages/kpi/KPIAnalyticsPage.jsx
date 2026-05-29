import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import KPISummaryReport from '../../components/kpi/analytics/KPISummaryReport';
import DepartmentPerformanceReport from '../../components/kpi/analytics/DepartmentPerformanceReport';
import OrganizationHealthReport from '../../components/kpi/analytics/OrganizationHealthReport';
import PerformanceHeatmap from '../../components/kpi/analytics/PerformanceHeatmap';
import AnalyticsExport from '../../components/kpi/analytics/AnalyticsExport';
import { PeriodSelector } from '../../components/kpi/common';
import styles from './KPIAnalyticsPage.module.css';

const KPIAnalyticsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('kpi');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const tabs = [
        { id: 'kpi', label: 'KPI Summary', icon: '📊' },
        { id: 'department', label: 'Department Performance', icon: '🏢' },
        { id: 'health', label: 'Organization Health', icon: '❤️' },
        { id: 'heatmap', label: 'Performance Heatmap', icon: '🔥' },
        { id: 'export', label: 'Export', icon: '📥' },
    ];

    const handlePeriodChange = (year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
        setRefreshTrigger(prev => prev + 1);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'kpi':
                return (
                    <KPISummaryReport
                        tenantId={user?.tenantId}
                        year={selectedYear}
                        month={selectedMonth}
                        refreshTrigger={refreshTrigger}
                    />
                );
            case 'department':
                return (
                    <DepartmentPerformanceReport
                        tenantId={user?.tenantId}
                        year={selectedYear}
                        month={selectedMonth}
                        refreshTrigger={refreshTrigger}
                    />
                );
            case 'health':
                return (
                    <OrganizationHealthReport
                        tenantId={user?.tenantId}
                        year={selectedYear}
                        month={selectedMonth}
                        refreshTrigger={refreshTrigger}
                    />
                );
            case 'heatmap':
                return (
                    <PerformanceHeatmap
                        tenantId={user?.tenantId}
                        year={selectedYear}
                        month={selectedMonth}
                        refreshTrigger={refreshTrigger}
                    />
                );
            case 'export':
                return (
                    <AnalyticsExport
                        year={selectedYear}
                        month={selectedMonth}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Analytics & Insights</h1>
                <p className={styles.subtitle}>
                    Comprehensive performance analytics and organizational insights
                </p>
            </div>

            <div className={styles.periodSection}>
                <PeriodSelector
                    year={selectedYear}
                    month={selectedMonth}
                    onChange={handlePeriodChange}
                    minYear={2023}
                    maxYear={new Date().getFullYear() + 1}
                />
            </div>

            <div className={styles.tabs}>
                {tabs.map(tab => (
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

            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};

export default KPIAnalyticsPage;