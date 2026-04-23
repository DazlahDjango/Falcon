import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChampionDashboardHeader from './ChampionDashboardHeader';
import ComplianceOverview from './ComplianceOverview';
import DepartmentCompliance from './DepartmentCompliance';
import RedAlertsList from './RedAlertsList';
import EscalationsList from './EscalationsList';
import PeriodSelector from '../../common/PeriodSelector';
import styles from './ChampionDashboard.module.css';

const ChampionDashboard = ({ 
    championId, 
    initialData, 
    isLoading, 
    onPeriodChange,
    onRefresh,
    onResolveEscalation 
}) => {
    const [dashboardData, setDashboardData] = useState(initialData || null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        if (initialData) {
            setDashboardData(initialData);
        }
    }, [initialData]);
    const handlePeriodChange = (year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
        if (onPeriodChange) {
            onPeriodChange(year, month);
        }
    };
    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh(selectedYear, selectedMonth);
        }
        setRefreshing(false);
    };
    if (isLoading && !dashboardData) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading champion dashboard...</p>
            </div>
        );
    }
    if (!dashboardData) {
        return (
            <div className={styles.emptyContainer}>
                <p>No compliance data available for the selected period.</p>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refresh
                </button>
            </div>
        );
    }
    return (
        <div className={styles.dashboard}>
            <ChampionDashboardHeader 
                period={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />
            <div className={styles.periodSelector}>
                <PeriodSelector
                    year={selectedYear}
                    month={selectedMonth}
                    onChange={handlePeriodChange}
                    minYear={2020}
                    maxYear={new Date().getFullYear() + 2}
                />
            </div>
            <ComplianceOverview 
                organizationSubmissionRate={dashboardData.organizationSubmissionRate}
                pendingEscalations={dashboardData.pendingEscalations}
                unvalidatedEntries={dashboardData.unvalidatedEntries}
            />
            <div className={styles.dashboardGrid}>
                <div className={styles.complianceColumn}>
                    <DepartmentCompliance 
                        departments={dashboardData.departmentCompliance}
                    />
                </div>
                <div className={styles.alertsColumn}>
                    <RedAlertsList alerts={dashboardData.redKPIAlerts} />
                </div>
            </div>
            <div className={styles.escalationsSection}>
                <EscalationsList 
                    escalations={dashboardData.escalations}
                    onResolve={onResolveEscalation}
                />
            </div>
        </div>
    );
};
ChampionDashboard.propTypes = {
    championId: PropTypes.string.isRequired,
    initialData: PropTypes.shape({
        organizationSubmissionRate: PropTypes.number,
        pendingEscalations: PropTypes.number,
        unvalidatedEntries: PropTypes.number,
        departmentCompliance: PropTypes.array,
        redKPIAlerts: PropTypes.array,
        escalations: PropTypes.array,
    }),
    isLoading: PropTypes.bool,
    onPeriodChange: PropTypes.func,
    onRefresh: PropTypes.func,
    onResolveEscalation: PropTypes.func,
};
ChampionDashboard.defaultProps = {
    isLoading: false,
};
export default ChampionDashboard;