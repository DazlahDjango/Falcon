import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ExecutiveDashboardHeader from './ExecutiveDashboardHeader';
import OrganizationHealthCard from './OrganizationHealthCard';
import DepartmentRanking from './DepartmentRanking';
import KPIOverview from './KPIOverview';
import TrendAnalysis from './TrendAnalysis';
import RiskIndicators from './RiskIndicators';
import PeriodSelector from '../../common/PeriodSelector';
import styles from './ExecutiveDashboard.module.css';

const ExecutiveDashboard = ({ 
    tenantId, 
    initialData, 
    isLoading, 
    onPeriodChange,
    onRefresh 
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
                <p>Loading executive dashboard...</p>
            </div>
        );
    }
    if (!dashboardData) {
        return (
            <div className={styles.emptyContainer}>
                <p>No organizational data available for the selected period.</p>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refresh
                </button>
            </div>
        );
    }
    return (
        <div className={styles.dashboard}>
            <ExecutiveDashboardHeader 
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
    tenantId: PropTypes.string.isRequired,
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
};
ExecutiveDashboard.defaultProps = {
    isLoading: false,
};
export default ExecutiveDashboard;