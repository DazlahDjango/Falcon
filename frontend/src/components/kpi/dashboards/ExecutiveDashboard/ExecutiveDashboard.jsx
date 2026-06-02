import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ExecutiveDashboardHeader from './ExecutiveDashboardHeader';
import OrganizationHealthCard from './OrganizationHealthCard';
import DepartmentRanking from './DepartmentRanking';
import KPIOverview from './KPIOverview';
import TrendAnalysis from './TrendAnalysis';
import RiskIndicators from './RiskIndicators';
import styles from './ExecutiveDashboard.module.css';

const ExecutiveDashboard = ({
    tenantId,
    initialData,
    isLoading,
    onPeriodChange,
    onRefresh,
    period
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    if (isLoading && !initialData) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading executive dashboard...</p>
            </div>
        );
    }

    if (!initialData) {
        return (
            <div className={styles.emptyContainer}>
                <p>No organizational data available for the selected period.</p>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refresh
                </button>
            </div>
        );
    }

    // Format period for display
    const periodDisplay = period
        ? `${period.year}-${String(period.month).padStart(2, '0')}`
        : 'Current Period';

    // Use mapped data directly - no transformation needed!
    const dashboardData = initialData;

    return (
        <div className={styles.dashboard}>
            <ExecutiveDashboardHeader
                period={periodDisplay}
                onRefresh={handleRefresh}
                refreshing={refreshing || isLoading}
            />

            <div className={styles.healthSection}>
                <OrganizationHealthCard
                    overallHealth={dashboardData.overallHealth}
                    redKPICount={dashboardData.redKPICount}
                    redKPIPercentage={dashboardData.redKPIPercentage}
                    validationCompliance={dashboardData.validationCompliance}
                />
            </div>

            <div className={styles.dashboardGrid}>
                <div className={styles.rankingColumn}>
                    <DepartmentRanking
                        departments={dashboardData.departmentRankings}
                    />
                </div>
                <div className={styles.kpiColumn}>
                    <KPIOverview
                        redKPICount={dashboardData.redKPICount}
                        totalKPIs={dashboardData.totalKPIs}
                        greenCount={dashboardData.greenCount}
                        yellowCount={dashboardData.yellowCount}
                        redCount={dashboardData.redCount}
                    />
                </div>
            </div>

            <div className={styles.trendSection}>
                <TrendAnalysis trendData={dashboardData.trendData} />
            </div>

            {dashboardData.riskIndicators && (
                <div className={styles.riskSection}>
                    <RiskIndicators indicators={dashboardData.riskIndicators} />
                </div>
            )}
        </div>
    );
};

ExecutiveDashboard.propTypes = {
    tenantId: PropTypes.string,
    initialData: PropTypes.shape({
        overallHealth: PropTypes.number,
        redKPICount: PropTypes.number,
        redKPIPercentage: PropTypes.number,
        validationCompliance: PropTypes.number,
        departmentRankings: PropTypes.array,
        totalKPIs: PropTypes.number,
        greenCount: PropTypes.number,
        yellowCount: PropTypes.number,
        redCount: PropTypes.number,
        trendData: PropTypes.array,
        riskIndicators: PropTypes.object,
    }),
    isLoading: PropTypes.bool,
    onPeriodChange: PropTypes.func,
    onRefresh: PropTypes.func,
    period: PropTypes.shape({
        year: PropTypes.number,
        month: PropTypes.number
    })
};

ExecutiveDashboard.defaultProps = {
    isLoading: false,
    initialData: null
};

export default ExecutiveDashboard;